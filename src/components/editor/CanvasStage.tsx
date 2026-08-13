'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Stage, Layer, Text, Rect, Circle, Line, Image as KonvaImage, Transformer } from 'react-konva';
import Konva from 'konva';
import { useEditor, SAMPLE_DATA as GLOBAL_SAMPLE_DATA } from '@/lib/editor/useEditorStore';
import { DocumentElement } from '@/lib/editor/documentModel';
import { computeSnap, SnapGuide } from '@/lib/editor/snappingEngine';
import QRCode from 'qrcode';

const AsyncKonvaImage: React.FC<{
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  onClick?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDragStart?: () => void;
  onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd?: (e: Konva.KonvaEventObject<Event>) => void;
  draggable: boolean;
  id: string;
}> = ({ src, x, y, width, height, rotation, opacity, onClick, onDragStart, onDragEnd, onTransformEnd, draggable, id }) => {
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) return;
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.src = src;
    img.onload = () => setImageObj(img);
  }, [src]);

  if (!imageObj) return null;

  return (
    <KonvaImage
      id={id}
      image={imageObj}
      x={x}
      y={y}
      width={width}
      height={height}
      rotation={rotation}
      opacity={opacity}
      onClick={onClick}
      onTap={(e) => onClick && onClick(e as unknown as Konva.KonvaEventObject<MouseEvent>)}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
    />
  );
};

interface CanvasStageProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  backgroundImageUrl?: string;
  elements?: DocumentElement[];
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onUpdateElement?: (id: string, attrs: Partial<DocumentElement>) => void;
  zoomLevel?: number;
  isPreviewMode?: boolean;
  sampleData?: Record<string, string>;
}

export const CanvasStage: React.FC<CanvasStageProps> = (props) => {
  // Try hook context first; fallback to props for standalone presenter mode
  let storeState = null;
  let dispatchFn: ReturnType<typeof useEditor>['dispatch'] | null = null;
  try {
    const ctx = useEditor();
    storeState = ctx.state;
    dispatchFn = ctx.dispatch;
  } catch {
    // Standalone mode without EditorProvider
  }

  const docWidth = props.width ?? storeState?.document.width ?? 842;
  const docHeight = props.height ?? storeState?.document.height ?? 595;
  const backgroundColor = props.backgroundColor ?? storeState?.document.backgroundColor ?? '#FFFFFF';
  const backgroundImageUrl = props.backgroundImageUrl ?? storeState?.document.backgroundDataUrl;
  const elements = props.elements ?? storeState?.document.elements ?? [];
  const zoomLevel = props.zoomLevel ?? storeState?.viewport.zoom ?? 0.85;
  const isPreviewMode = props.isPreviewMode ?? storeState?.isPreviewMode ?? false;
  const showFieldNames = storeState?.showFieldNames ?? false;
  const sampleData = props.sampleData ?? GLOBAL_SAMPLE_DATA;
  const selectedIds = props.selectedId !== undefined ? (props.selectedId ? [props.selectedId] : []) : storeState?.selection.selectedIds ?? [];
  const snapGuides = storeState?.snapGuides ?? [];
  const snappingEnabled = storeState?.snappingEnabled ?? true;
  const showSafeArea = storeState?.showSafeArea ?? true;

  const trRef = useRef<Konva.Transformer>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [bgImageObj, setBgImageObj] = useState<HTMLImageElement | null>(null);

  // Synchronize Konva Transformer with selection
  useEffect(() => {
    if (trRef.current && stageRef.current) {
      const nodes: Konva.Node[] = [];
      selectedIds.forEach((id) => {
        const node = stageRef.current?.findOne('#' + id);
        if (node) nodes.push(node);
      });
      trRef.current.nodes(nodes);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selectedIds, elements]);

  // QR Code images
  useEffect(() => {
    elements.filter((e) => e.type === 'qr').forEach((elem) => {
      const codeValue = sampleData['{{certificate.code}}'] || 'ABC-REACT-2026-0001';
      QRCode.toDataURL(codeValue, {
        color: {
          dark: elem.qrStyle?.fgColor || '#000000',
          light: elem.qrStyle?.bgColor || '#FFFFFF',
        },
        margin: 1,
      }).then((url) => {
        setQrImages((prev) => ({ ...prev, [elem.id]: url }));
      });
    });
  }, [elements, sampleData]);

  // Background Image
  useEffect(() => {
    if (!backgroundImageUrl) {
      setBgImageObj(null);
      return;
    }
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.src = backgroundImageUrl;
    img.onload = () => setImageObj(img);
    function setImageObj(image: HTMLImageElement) {
      setBgImageObj(image);
    }
  }, [backgroundImageUrl]);

  // Dragging and Snapping handlers
  const handleDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>, elem: DocumentElement) => {
      const node = e.target;
      const snapResult = computeSnap(
        elem.id,
        node.x(),
        node.y(),
        elem.width,
        elem.height,
        elements,
        docWidth,
        docHeight,
        snappingEnabled,
      );
      node.x(snapResult.x);
      node.y(snapResult.y);
      if (dispatchFn) dispatchFn({ type: 'SET_SNAP_GUIDES', guides: snapResult.guides });
    },
    [elements, docWidth, docHeight, snappingEnabled, dispatchFn],
  );

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>, elem: DocumentElement) => {
      const node = e.target;
      if (dispatchFn) {
        dispatchFn({ type: 'SET_SNAP_GUIDES', guides: [] });
        dispatchFn({
          type: 'UPDATE_ELEMENT',
          id: elem.id,
          attrs: { x: Math.round(node.x()), y: Math.round(node.y()) },
          coalesce: true,
          label: `Move ${elem.name}`,
        });
      } else if (props.onUpdateElement) {
        props.onUpdateElement(elem.id, { x: Math.round(node.x()), y: Math.round(node.y()) });
      }
    },
    [dispatchFn, props],
  );

  const handleTransformEnd = useCallback(
    (e: Konva.KonvaEventObject<Event>, elem: DocumentElement) => {
      const node = e.target;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);

      const attrs = {
        x: Math.round(node.x()),
        y: Math.round(node.y()),
        width: Math.max(10, Math.round(node.width() * scaleX)),
        height: Math.max(10, Math.round(node.height() * scaleY)),
        rotation: Math.round(node.rotation()),
      };

      if (dispatchFn) {
        dispatchFn({ type: 'UPDATE_ELEMENT', id: elem.id, attrs, label: `Resize ${elem.name}` });
      } else if (props.onUpdateElement) {
        props.onUpdateElement(elem.id, attrs);
      }
    },
    [dispatchFn, props],
  );

  const handleElementClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>, id: string) => {
      e.cancelBubble = true;
      if (dispatchFn) {
        if (e.evt.shiftKey) {
          dispatchFn({ type: 'SHIFT_SELECT', id });
        } else {
          dispatchFn({ type: 'SELECT', id });
        }
      } else if (props.onSelect) {
        props.onSelect(id);
      }
    },
    [dispatchFn, props],
  );

  const stageWidth = docWidth * zoomLevel;
  const stageHeight = docHeight * zoomLevel;

  return (
    <div className="relative flex items-center justify-center p-8 select-none">
      <div
        className="relative shadow-2xl rounded-sm border border-slate-300 overflow-hidden bg-white transition-all duration-75"
        style={{
          width: stageWidth,
          height: stageHeight,
        }}
      >
        <Stage
          ref={stageRef}
          width={stageWidth}
          height={stageHeight}
          scaleX={zoomLevel}
          scaleY={zoomLevel}
          onMouseDown={(e) => {
            if (e.target === e.target.getStage()) {
              if (dispatchFn) dispatchFn({ type: 'CLEAR_SELECTION' });
              else if (props.onSelect) props.onSelect(null);
            }
          }}
        >
          <Layer>
            {/* Canvas Solid Background */}
            <Rect x={0} y={0} width={docWidth} height={docHeight} fill={backgroundColor || '#FFFFFF'} />

            {/* Canvas Background Image */}
            {bgImageObj && (
              <KonvaImage image={bgImageObj} x={0} y={0} width={docWidth} height={docHeight} listening={false} />
            )}

            {/* Printable Safe Area Line */}
            {showSafeArea && !isPreviewMode && (
              <Rect
                x={15}
                y={15}
                width={docWidth - 30}
                height={docHeight - 30}
                stroke="#CBD5E1"
                strokeWidth={1}
                dash={[4, 4]}
                listening={false}
              />
            )}

            {/* Renderable Elements */}
            {[...elements]
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((elem) => {
                if (!elem.visible) return null;

                const isDraggable = !elem.locked && !isPreviewMode;

                // Display text computation
                let textToDisplay = elem.textValue || '';
                if (elem.type === 'dynamic-text' && elem.dynamicBinding) {
                  textToDisplay = showFieldNames && !isPreviewMode
                    ? elem.dynamicBinding
                    : sampleData[elem.dynamicBinding] || elem.fallbackValue || elem.dynamicBinding;
                }

                return (
                  <React.Fragment key={elem.id}>
                    {/* TEXT, DYNAMIC TEXT & CERTIFICATE CODE */}
                    {(elem.type === 'text' || elem.type === 'dynamic-text' || elem.type === 'certificate-code') && (
                      <Text
                        id={elem.id}
                        x={elem.x}
                        y={elem.y}
                        width={elem.width}
                        text={textToDisplay}
                        fontSize={elem.textStyle?.fontSize || 16}
                        fontFamily={elem.textStyle?.fontFamily || 'Helvetica'}
                        fontStyle={`${elem.textStyle?.fontWeight || 'normal'} ${elem.textStyle?.fontStyle || 'normal'}`}
                        fill={elem.textStyle?.fill || '#0F172A'}
                        align={elem.textStyle?.align || 'left'}
                        opacity={elem.opacity}
                        rotation={elem.rotation}
                        draggable={isDraggable}
                        onClick={(e) => handleElementClick(e, elem.id)}
                        onTap={(e) => handleElementClick(e as unknown as Konva.KonvaEventObject<MouseEvent>, elem.id)}
                        onDragMove={(e) => handleDragMove(e, elem)}
                        onDragEnd={(e) => handleDragEnd(e, elem)}
                        onTransformEnd={(e) => handleTransformEnd(e, elem)}
                      />
                    )}

                    {/* SHAPES */}
                    {elem.type === 'shape' && (elem.shapeStyle?.shapeType === 'rectangle' || elem.shapeStyle?.shapeType === 'rounded-rectangle') && (
                      <Rect
                        id={elem.id}
                        x={elem.x}
                        y={elem.y}
                        width={elem.width}
                        height={elem.height}
                        fill={elem.shapeStyle.fill}
                        stroke={elem.shapeStyle.stroke}
                        strokeWidth={elem.shapeStyle.strokeWidth}
                        cornerRadius={elem.shapeStyle.cornerRadius || 0}
                        opacity={elem.opacity}
                        rotation={elem.rotation}
                        draggable={isDraggable}
                        onClick={(e) => handleElementClick(e, elem.id)}
                        onTap={(e) => handleElementClick(e as unknown as Konva.KonvaEventObject<MouseEvent>, elem.id)}
                        onDragMove={(e) => handleDragMove(e, elem)}
                        onDragEnd={(e) => handleDragEnd(e, elem)}
                        onTransformEnd={(e) => handleTransformEnd(e, elem)}
                      />
                    )}

                    {elem.type === 'shape' && elem.shapeStyle?.shapeType === 'circle' && (
                      <Circle
                        id={elem.id}
                        x={elem.x + elem.width / 2}
                        y={elem.y + elem.height / 2}
                        radius={elem.width / 2}
                        fill={elem.shapeStyle.fill}
                        stroke={elem.shapeStyle.stroke}
                        strokeWidth={elem.shapeStyle.strokeWidth}
                        opacity={elem.opacity}
                        draggable={isDraggable}
                        onClick={(e) => handleElementClick(e, elem.id)}
                        onTap={(e) => handleElementClick(e as unknown as Konva.KonvaEventObject<MouseEvent>, elem.id)}
                        onDragEnd={(e) => {
                          const attrs = {
                            x: Math.round(e.target.x() - elem.width / 2),
                            y: Math.round(e.target.y() - elem.height / 2),
                          };
                          if (dispatchFn) dispatchFn({ type: 'UPDATE_ELEMENT', id: elem.id, attrs });
                          else if (props.onUpdateElement) props.onUpdateElement(elem.id, attrs);
                        }}
                      />
                    )}

                    {elem.type === 'shape' && (elem.shapeStyle?.shapeType === 'line' || elem.shapeStyle?.shapeType === 'arrow') && (
                      <Line
                        id={elem.id}
                        x={elem.x}
                        y={elem.y}
                        points={[0, 0, elem.width, 0]}
                        stroke={elem.shapeStyle.stroke || '#0F172A'}
                        strokeWidth={elem.shapeStyle.strokeWidth || 2}
                        opacity={elem.opacity}
                        draggable={isDraggable}
                        onClick={(e) => handleElementClick(e, elem.id)}
                        onTap={(e) => handleElementClick(e as unknown as Konva.KonvaEventObject<MouseEvent>, elem.id)}
                        onDragEnd={(e) => {
                          const attrs = { x: Math.round(e.target.x()), y: Math.round(e.target.y()) };
                          if (dispatchFn) dispatchFn({ type: 'UPDATE_ELEMENT', id: elem.id, attrs });
                          else if (props.onUpdateElement) props.onUpdateElement(elem.id, attrs);
                        }}
                      />
                    )}

                    {/* IMAGES / LOGOS / SIGNATURES */}
                    {(elem.type === 'image' || elem.type === 'logo' || elem.type === 'signature') && elem.imageStyle?.src && (
                      <AsyncKonvaImage
                        id={elem.id}
                        src={elem.imageStyle.src}
                        x={elem.x}
                        y={elem.y}
                        width={elem.width}
                        height={elem.height}
                        rotation={elem.rotation}
                        opacity={elem.opacity}
                        draggable={isDraggable}
                        onClick={(e) => handleElementClick(e, elem.id)}
                        onDragStart={() => dispatchFn && dispatchFn({ type: 'SET_SNAP_GUIDES', guides: [] })}
                        onDragEnd={(e) => handleDragEnd(e, elem)}
                        onTransformEnd={(e) => handleTransformEnd(e, elem)}
                      />
                    )}

                    {/* QR CODE */}
                    {elem.type === 'qr' && qrImages[elem.id] && (
                      <AsyncKonvaImage
                        id={elem.id}
                        src={qrImages[elem.id]}
                        x={elem.x}
                        y={elem.y}
                        width={elem.width}
                        height={elem.height}
                        rotation={elem.rotation}
                        opacity={elem.opacity}
                        draggable={isDraggable}
                        onClick={(e) => handleElementClick(e, elem.id)}
                        onDragEnd={(e) => handleDragEnd(e, elem)}
                        onTransformEnd={(e) => handleTransformEnd(e, elem)}
                      />
                    )}

                    {/* BORDER ELEMENT */}
                    {elem.type === 'border' && (
                      <Rect
                        id={elem.id}
                        x={elem.x}
                        y={elem.y}
                        width={elem.width}
                        height={elem.height}
                        fill="transparent"
                        stroke={elem.borderStyle?.color || '#1E40AF'}
                        strokeWidth={elem.borderStyle?.width || 2}
                        opacity={elem.opacity}
                        draggable={isDraggable}
                        onClick={(e) => handleElementClick(e, elem.id)}
                        onDragEnd={(e) => handleDragEnd(e, elem)}
                        onTransformEnd={(e) => handleTransformEnd(e, elem)}
                      />
                    )}
                  </React.Fragment>
                );
              })}

            {/* Dynamic Snapping Guide Lines */}
            {!isPreviewMode &&
              snapGuides.map((guide, i) => (
                <Line
                  key={i}
                  points={
                    guide.orientation === 'vertical'
                      ? [guide.position, 0, guide.position, docHeight]
                      : [0, guide.position, docWidth, guide.position]
                  }
                  stroke="#3B82F6"
                  strokeWidth={1}
                  dash={[2, 2]}
                  listening={false}
                />
              ))}

            {/* Konva Transformer */}
            {!isPreviewMode && (
              <Transformer
                ref={trRef}
                boundBoxFunc={(oldBox, newBox) => (newBox.width < 10 || newBox.height < 10 ? oldBox : newBox)}
                anchorFill="#3B82F6"
                anchorStroke="#FFFFFF"
                anchorCornerRadius={3}
                borderStroke="#3B82F6"
                borderDash={[3, 3]}
              />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};
