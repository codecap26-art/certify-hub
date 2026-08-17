'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Stage,
  Layer,
  Text,
  Rect,
  Circle,
  Ellipse,
  Star,
  RegularPolygon,
  Line,
  Group,
  Image as KonvaImage,
  Transformer,
} from 'react-konva';
import Konva from 'konva';
import { useEditor, SAMPLE_DATA as GLOBAL_SAMPLE_DATA } from '@/lib/editor/useEditorStore';
import { DocumentElement } from '@/lib/editor/documentModel';
import { computeSnap, SnapGuide } from '@/lib/editor/snappingEngine';
import { calculateAutoFitFontSize } from '@/lib/editor/textAutoFit';
import { RulerBar } from './RulerBar';
import { InlineTextEditor } from './InlineTextEditor';
import { CanvasContextMenu } from './CanvasContextMenu';
import QRCode from 'qrcode';

const getDashPattern = (style?: 'solid' | 'dashed' | 'dotted') => {
  if (style === 'dashed') return [8, 6];
  if (style === 'dotted') return [3, 4];
  return undefined;
};

// ---------------------------------------------------------------------------
// Async Image with Masking Support
// ---------------------------------------------------------------------------
const AsyncKonvaImage: React.FC<{
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
  cornerRadius?: number;
  maskShape?: string;
  borderWidth?: number;
  borderColor?: string;
  flipH?: boolean;
  flipV?: boolean;
  onClick?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onContextMenu?: (e: Konva.KonvaEventObject<PointerEvent>) => void;
  onDragStart?: () => void;
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd?: (e: Konva.KonvaEventObject<Event>) => void;
  draggable: boolean;
  id: string;
}> = ({
  src,
  x,
  y,
  width,
  height,
  rotation,
  opacity,
  cropX,
  cropY,
  cropWidth,
  cropHeight,
  cornerRadius,
  maskShape = 'none',
  borderWidth = 0,
  borderColor = '#CBD5E1',
  flipH,
  flipV,
  onClick,
  onContextMenu,
  onDragStart,
  onDragMove,
  onDragEnd,
  onTransformEnd,
  draggable,
  id,
}) => {
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) return;
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.src = src;
    img.onload = () => setImageObj(img);
  }, [src]);

  if (!imageObj) return null;

  const crop =
    cropWidth && cropHeight
      ? {
          x: cropX || 0,
          y: cropY || 0,
          width: cropWidth,
          height: cropHeight,
        }
      : undefined;

  // Mask clipping function based on mask shape
  const clipFunc = (ctx: any) => {
    const w = width;
    const h = height;
    const radius = Math.min(w, h) / 2;

    if (maskShape === 'circle') {
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2, false);
      ctx.closePath();
    } else if (maskShape === 'hexagon') {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const px = w / 2 + radius * Math.cos(angle);
        const py = h / 2 + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else if (maskShape === 'badge' || maskShape === 'seal') {
      const points = 12;
      const inner = radius * 0.8;
      ctx.beginPath();
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? radius : inner;
        const angle = (i * Math.PI) / points;
        const px = w / 2 + r * Math.cos(angle);
        const py = h / 2 + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else if (maskShape === 'rounded') {
      const r = 16;
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(w - r, 0);
      ctx.quadraticCurveTo(w, 0, w, r);
      ctx.lineTo(w, h - r);
      ctx.quadraticCurveTo(w, h, w - r, h);
      ctx.lineTo(r, h);
      ctx.quadraticCurveTo(0, h, 0, h - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.closePath();
    } else {
      ctx.rect(0, 0, w, h);
    }
  };

  if (maskShape && maskShape !== 'none') {
    return (
      <Group
        id={id}
        x={x}
        y={y}
        width={width}
        height={height}
        rotation={rotation}
        opacity={opacity}
        draggable={draggable}
        onClick={onClick}
        onContextMenu={onContextMenu}
        onTap={(e) => onClick && onClick(e as unknown as Konva.KonvaEventObject<MouseEvent>)}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        onTransformEnd={onTransformEnd}
        clipFunc={clipFunc}
      >
        <KonvaImage
          image={imageObj}
          x={0}
          y={0}
          width={width}
          height={height}
          crop={crop}
          scaleX={flipH ? -1 : 1}
          scaleY={flipV ? -1 : 1}
        />
        {borderWidth && borderWidth > 0 ? (
          <Rect x={0} y={0} width={width} height={height} stroke={borderColor} strokeWidth={borderWidth} listening={false} />
        ) : null}
      </Group>
    );
  }

  return (
    <KonvaImage
      id={id}
      image={imageObj}
      x={x}
      y={y}
      width={width}
      height={height}
      crop={crop}
      cornerRadius={cornerRadius || 0}
      stroke={borderWidth && borderWidth > 0 ? borderColor : undefined}
      strokeWidth={borderWidth || 0}
      scaleX={flipH ? -1 : 1}
      scaleY={flipV ? -1 : 1}
      rotation={rotation}
      opacity={opacity}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onTap={(e) => onClick && onClick(e as unknown as Konva.KonvaEventObject<MouseEvent>)}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
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
  let storeState = null;
  let dispatchFn: ReturnType<typeof useEditor>['dispatch'] | null = null;
  try {
    const ctx = useEditor();
    storeState = ctx.state;
    dispatchFn = ctx.dispatch;
  } catch {
    // Standalone presenter fallback
  }

  const docWidth = props.width ?? storeState?.document.width ?? 842;
  const docHeight = props.height ?? storeState?.document.height ?? 595;
  const backgroundColor = props.backgroundColor ?? storeState?.document.backgroundColor ?? '#FFFFFF';
  const backgroundImageUrl = props.backgroundImageUrl ?? storeState?.document.backgroundDataUrl;
  const backgroundGradient = storeState?.document.backgroundGradient;
  const elements = props.elements ?? storeState?.document.elements ?? [];
  const zoomLevel = props.zoomLevel ?? storeState?.viewport.zoom ?? 0.85;
  const isPreviewMode = props.isPreviewMode ?? storeState?.isPreviewMode ?? false;
  const showFieldNames = storeState?.showFieldNames ?? false;
  const sampleData = props.sampleData ?? GLOBAL_SAMPLE_DATA;
  const selectedIds = props.selectedId !== undefined ? (props.selectedId ? [props.selectedId] : []) : storeState?.selection.selectedIds ?? [];
  const snapGuides = storeState?.snapGuides ?? [];
  const snappingEnabled = storeState?.snappingEnabled ?? true;
  const showRulers = storeState?.showRulers ?? false;
  const showGrid = storeState?.showGrid ?? false;
  const showSafeArea = storeState?.showSafeArea ?? true;
  const showBleedArea = storeState?.showBleedArea ?? false;
  const safeMarginPx = storeState?.safeMarginPx ?? 40;

  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  // Marquee Selection state
  const [isMarqueeActive, setIsMarqueeActive] = useState(false);
  const [marqueeBox, setMarqueeBox] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);

  // Live transform tooltip state
  const [transformInfo, setTransformInfo] = useState<{ x: number; y: number; w: number; h: number; rot: number } | null>(null);

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
      const codeValue = sampleData['{{certificate.code}}'] || 'CERT-2026-REACT-0842';
      QRCode.toDataURL(`https://certifyhub.app/verify/${codeValue}`, {
        color: {
          dark: elem.qrStyle?.fgColor || '#0F172A',
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
    img.onload = () => setBgImageObj(img);
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

      setTransformInfo({
        x: Math.round(snapResult.x),
        y: Math.round(snapResult.y),
        w: elem.width,
        h: elem.height,
        rot: Math.round(node.rotation()),
      });

      if (dispatchFn) dispatchFn({ type: 'SET_SNAP_GUIDES', guides: snapResult.guides });
    },
    [elements, docWidth, docHeight, snappingEnabled, dispatchFn],
  );

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>, elem: DocumentElement) => {
      const node = e.target;
      setTransformInfo(null);
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
      setTransformInfo(null);

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

  const handleContextMenu = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent>, elemId?: string) => {
      e.evt.preventDefault();
      if (elemId && dispatchFn && !selectedIds.includes(elemId)) {
        dispatchFn({ type: 'SELECT', id: elemId });
      }
      setContextMenuPos({ x: e.evt.clientX, y: e.evt.clientY });
    },
    [dispatchFn, selectedIds],
  );

  // Marquee handlers on stage background
  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target !== e.target.getStage()) return;
    const pointer = stageRef.current?.getRelativePointerPosition();
    if (!pointer) return;

    if (dispatchFn && !e.evt.shiftKey) {
      dispatchFn({ type: 'CLEAR_SELECTION' });
    }
    setEditingElementId(null);
    setIsMarqueeActive(true);
    setMarqueeBox({
      startX: pointer.x,
      startY: pointer.y,
      currentX: pointer.x,
      currentY: pointer.y,
    });
  };

  const handleStageMouseMove = () => {
    if (!isMarqueeActive || !marqueeBox) return;
    const pointer = stageRef.current?.getRelativePointerPosition();
    if (!pointer) return;

    setMarqueeBox((prev) => (prev ? { ...prev, currentX: pointer.x, currentY: pointer.y } : null));
  };

  const handleStageMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isMarqueeActive || !marqueeBox) return;
    setIsMarqueeActive(false);

    const x = Math.min(marqueeBox.startX, marqueeBox.currentX);
    const y = Math.min(marqueeBox.startY, marqueeBox.currentY);
    const w = Math.abs(marqueeBox.currentX - marqueeBox.startX);
    const h = Math.abs(marqueeBox.currentY - marqueeBox.startY);

    if (w > 5 && h > 5 && dispatchFn) {
      dispatchFn({
        type: 'MARQUEE_SELECT',
        rect: { x, y, width: w, height: h },
        append: e.evt.shiftKey,
      });
    }
    setMarqueeBox(null);
  };

  const editingElem = elements.find((e) => e.id === editingElementId);
  const stageWidth = docWidth * zoomLevel;
  const stageHeight = docHeight * zoomLevel;

  return (
    <div className="relative flex flex-col items-center justify-center p-8 select-none">
      {/* Top Ruler Bar */}
      {showRulers && !isPreviewMode && (
        <div className="mb-1 ml-6">
          <RulerBar orientation="horizontal" length={docWidth} zoomLevel={zoomLevel} />
        </div>
      )}

      <div className="flex items-start">
        {/* Left Ruler Bar */}
        {showRulers && !isPreviewMode && (
          <div className="mr-1">
            <RulerBar orientation="vertical" length={docHeight} zoomLevel={zoomLevel} />
          </div>
        )}

        <div
          className="relative shadow-2xl rounded-sm border border-slate-300 overflow-hidden bg-white transition-all duration-75"
          style={{
            width: stageWidth,
            height: stageHeight,
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenuPos({ x: e.clientX, y: e.clientY });
          }}
        >
          <Stage
            ref={stageRef}
            width={stageWidth}
            height={stageHeight}
            scaleX={zoomLevel}
            scaleY={zoomLevel}
            onMouseDown={handleStageMouseDown}
            onMouseMove={handleStageMouseMove}
            onMouseUp={handleStageMouseUp}
          >
            <Layer>
              {/* Canvas Solid Background */}
              <Rect
                x={0}
                y={0}
                width={docWidth}
                height={docHeight}
                fill={
                  backgroundGradient?.stops && backgroundGradient.stops.length >= 2
                    ? undefined
                    : backgroundColor || '#FFFFFF'
                }
                fillLinearGradientStartPoint={
                  backgroundGradient?.type === 'linear' ? { x: 0, y: 0 } : undefined
                }
                fillLinearGradientEndPoint={
                  backgroundGradient?.type === 'linear' ? { x: docWidth, y: docHeight } : undefined
                }
                fillLinearGradientColorStops={
                  backgroundGradient?.type === 'linear' && backgroundGradient.stops
                    ? backgroundGradient.stops.flatMap((s) => [s.offset, s.color])
                    : undefined
                }
              />

              {/* Canvas Background Image */}
              {bgImageObj && (
                <KonvaImage image={bgImageObj} x={0} y={0} width={docWidth} height={docHeight} listening={false} />
              )}

              {/* Grid Lines Overlay */}
              {showGrid && !isPreviewMode && (
                <React.Fragment>
                  {Array.from({ length: Math.floor(docWidth / 20) }).map((_, i) => (
                    <Line
                      key={`grid-v-${i}`}
                      points={[i * 20, 0, i * 20, docHeight]}
                      stroke="#E2E8F0"
                      strokeWidth={0.5}
                      listening={false}
                    />
                  ))}
                  {Array.from({ length: Math.floor(docHeight / 20) }).map((_, i) => (
                    <Line
                      key={`grid-h-${i}`}
                      points={[0, i * 20, docWidth, i * 20]}
                      stroke="#E2E8F0"
                      strokeWidth={0.5}
                      listening={false}
                    />
                  ))}
                </React.Fragment>
              )}

              {/* Printable Safe Area Line */}
              {showSafeArea && !isPreviewMode && (
                <Rect
                  x={safeMarginPx}
                  y={safeMarginPx}
                  width={docWidth - safeMarginPx * 2}
                  height={docHeight - safeMarginPx * 2}
                  stroke="#94A3B8"
                  strokeWidth={1}
                  dash={[5, 5]}
                  listening={false}
                />
              )}

              {/* Bleed Area Overlay Line */}
              {showBleedArea && !isPreviewMode && (
                <Rect
                  x={8}
                  y={8}
                  width={docWidth - 16}
                  height={docHeight - 16}
                  stroke="#F43F5E"
                  strokeWidth={1}
                  dash={[3, 3]}
                  listening={false}
                />
              )}

              {/* Renderable Elements */}
              {[...elements]
                .sort((a, b) => a.zIndex - b.zIndex)
                .map((elem) => {
                  if (!elem.visible) return null;

                  const isDraggable = !elem.locked && !isPreviewMode;

                  // Text content with Auto-fit calculation
                  let textToDisplay = elem.textValue || '';
                  if (elem.type === 'dynamic-text' && elem.dynamicBinding) {
                    textToDisplay = showFieldNames && !isPreviewMode
                      ? elem.dynamicBinding
                      : sampleData[elem.dynamicBinding] || elem.fallbackValue || elem.dynamicBinding;
                  }

                  // Text transform
                  let finalFormattedText = textToDisplay;
                  if (elem.textStyle?.textTransform === 'uppercase') {
                    finalFormattedText = textToDisplay.toUpperCase();
                  } else if (elem.textStyle?.textTransform === 'lowercase') {
                    finalFormattedText = textToDisplay.toLowerCase();
                  } else if (elem.textStyle?.textTransform === 'capitalize') {
                    finalFormattedText = textToDisplay.replace(/\b\w/g, (l) => l.toUpperCase());
                  }

                  // Auto-fit font size calculation
                  let computedFontSize = elem.textStyle?.fontSize || 16;
                  if (elem.textStyle?.autoFit) {
                    computedFontSize = calculateAutoFitFontSize({
                      text: finalFormattedText,
                      fontFamily: elem.textStyle?.fontFamily || 'Inter',
                      fontWeight: elem.textStyle?.fontWeight || 'normal',
                      currentFontSize: elem.textStyle?.fontSize || 28,
                      minFontSize: elem.textStyle?.minFontSize || 14,
                      maxFontSize: elem.textStyle?.maxFontSize || 48,
                      containerWidth: elem.width,
                    });
                  }

                  return (
                    <React.Fragment key={elem.id}>
                      {/* TEXT, DYNAMIC TEXT & CERTIFICATE CODE */}
                      {(elem.type === 'text' || elem.type === 'dynamic-text' || elem.type === 'certificate-code') && (
                        <Group
                          id={elem.id}
                          x={elem.x}
                          y={elem.y}
                          width={elem.width}
                          height={elem.height}
                          rotation={elem.rotation}
                          opacity={elem.opacity}
                          draggable={isDraggable}
                          onClick={(e) => handleElementClick(e, elem.id)}
                          onContextMenu={(e) => handleContextMenu(e, elem.id)}
                          onDblClick={() => setEditingElementId(elem.id)}
                          onTap={(e) => handleElementClick(e as unknown as Konva.KonvaEventObject<MouseEvent>, elem.id)}
                          onDragMove={(e) => handleDragMove(e, elem)}
                          onDragEnd={(e) => handleDragEnd(e, elem)}
                          onTransformEnd={(e) => handleTransformEnd(e, elem)}
                        >
                          {/* Optional Background Highlight Box */}
                          {elem.textStyle?.backgroundColor && (
                            <Rect
                              x={0}
                              y={0}
                              width={elem.width}
                              height={elem.height}
                              fill={elem.textStyle.backgroundColor}
                              cornerRadius={4}
                            />
                          )}

                          <Text
                            x={0}
                            y={0}
                            width={elem.width}
                            text={finalFormattedText}
                            fontSize={computedFontSize}
                            fontFamily={elem.textStyle?.fontFamily || 'Inter'}
                            fontStyle={`${elem.textStyle?.fontWeight || 'normal'} ${elem.textStyle?.fontStyle || 'normal'}`}
                            fill={elem.textStyle?.fill || '#0F172A'}
                            align={elem.textStyle?.align || 'left'}
                            letterSpacing={elem.textStyle?.letterSpacing || 0}
                            lineHeight={elem.textStyle?.lineHeight || 1.2}
                            wrap="word"
                            shadowColor={elem.textStyle?.shadowColor}
                            shadowBlur={elem.textStyle?.shadowBlur || 0}
                            shadowOffset={
                              elem.textStyle?.shadowOffsetX || elem.textStyle?.shadowOffsetY
                                ? { x: elem.textStyle.shadowOffsetX || 0, y: elem.textStyle.shadowOffsetY || 0 }
                                : undefined
                            }
                            stroke={elem.textStyle?.stroke}
                            strokeWidth={elem.textStyle?.strokeWidth || 0}
                            textDecoration={elem.textStyle?.textDecoration === 'underline' ? 'underline' : elem.textStyle?.textDecoration === 'line-through' ? 'line-through' : undefined}
                          />
                        </Group>
                      )}

                      {/* SHAPES */}
                      {elem.type === 'shape' && elem.shapeStyle && (
                        <React.Fragment>
                          {/* RECTANGLE & ROUNDED RECTANGLE */}
                          {(elem.shapeStyle.shapeType === 'rectangle' || elem.shapeStyle.shapeType === 'rounded-rectangle') && (
                            <Rect
                              id={elem.id}
                              x={elem.x}
                              y={elem.y}
                              width={elem.width}
                              height={elem.height}
                              fill={elem.shapeStyle.fill === 'transparent' ? undefined : elem.shapeStyle.fill}
                              stroke={elem.shapeStyle.stroke === 'transparent' ? undefined : elem.shapeStyle.stroke}
                              strokeWidth={elem.shapeStyle.strokeWidth}
                              dash={getDashPattern(elem.shapeStyle.strokeStyle)}
                              cornerRadius={elem.shapeStyle.cornerRadius || 0}
                              shadowColor={elem.shapeStyle.shadowColor}
                              shadowBlur={elem.shapeStyle.shadowBlur || 0}
                              shadowOffset={
                                elem.shapeStyle.shadowOffsetX || elem.shapeStyle.shadowOffsetY
                                  ? { x: elem.shapeStyle.shadowOffsetX || 0, y: elem.shapeStyle.shadowOffsetY || 0 }
                                  : undefined
                              }
                              opacity={elem.opacity}
                              rotation={elem.rotation}
                              draggable={isDraggable}
                              onClick={(e) => handleElementClick(e, elem.id)}
                              onContextMenu={(e) => handleContextMenu(e, elem.id)}
                              onTap={(e) => handleElementClick(e as unknown as Konva.KonvaEventObject<MouseEvent>, elem.id)}
                              onDragMove={(e) => handleDragMove(e, elem)}
                              onDragEnd={(e) => handleDragEnd(e, elem)}
                              onTransformEnd={(e) => handleTransformEnd(e, elem)}
                            />
                          )}

                          {/* CIRCLE */}
                          {elem.shapeStyle.shapeType === 'circle' && (
                            <Circle
                              id={elem.id}
                              x={elem.x + elem.width / 2}
                              y={elem.y + elem.height / 2}
                              radius={Math.min(elem.width, elem.height) / 2}
                              fill={elem.shapeStyle.fill === 'transparent' ? undefined : elem.shapeStyle.fill}
                              stroke={elem.shapeStyle.stroke === 'transparent' ? undefined : elem.shapeStyle.stroke}
                              strokeWidth={elem.shapeStyle.strokeWidth}
                              dash={getDashPattern(elem.shapeStyle.strokeStyle)}
                              opacity={elem.opacity}
                              rotation={elem.rotation}
                              draggable={isDraggable}
                              onClick={(e) => handleElementClick(e, elem.id)}
                              onContextMenu={(e) => handleContextMenu(e, elem.id)}
                              onTap={(e) => handleElementClick(e as unknown as Konva.KonvaEventObject<MouseEvent>, elem.id)}
                              onDragMove={(e) => handleDragMove(e, elem)}
                              onDragEnd={(e) => handleDragEnd(e, elem)}
                              onTransformEnd={(e) => handleTransformEnd(e, elem)}
                            />
                          )}

                          {/* ELLIPSE */}
                          {elem.shapeStyle.shapeType === 'ellipse' && (
                            <Ellipse
                              id={elem.id}
                              x={elem.x + elem.width / 2}
                              y={elem.y + elem.height / 2}
                              radiusX={elem.width / 2}
                              radiusY={elem.height / 2}
                              fill={elem.shapeStyle.fill === 'transparent' ? undefined : elem.shapeStyle.fill}
                              stroke={elem.shapeStyle.stroke === 'transparent' ? undefined : elem.shapeStyle.stroke}
                              strokeWidth={elem.shapeStyle.strokeWidth}
                              dash={getDashPattern(elem.shapeStyle.strokeStyle)}
                              opacity={elem.opacity}
                              rotation={elem.rotation}
                              draggable={isDraggable}
                              onClick={(e) => handleElementClick(e, elem.id)}
                              onContextMenu={(e) => handleContextMenu(e, elem.id)}
                              onTap={(e) => handleElementClick(e as unknown as Konva.KonvaEventObject<MouseEvent>, elem.id)}
                              onDragMove={(e) => handleDragMove(e, elem)}
                              onDragEnd={(e) => handleDragEnd(e, elem)}
                              onTransformEnd={(e) => handleTransformEnd(e, elem)}
                            />
                          )}

                          {/* DIAMOND */}
                          {elem.shapeStyle.shapeType === 'diamond' && (
                            <Line
                              id={elem.id}
                              x={elem.x}
                              y={elem.y}
                              points={[elem.width / 2, 0, elem.width, elem.height / 2, elem.width / 2, elem.height, 0, elem.height / 2]}
                              closed
                              fill={elem.shapeStyle.fill === 'transparent' ? undefined : elem.shapeStyle.fill}
                              stroke={elem.shapeStyle.stroke === 'transparent' ? undefined : elem.shapeStyle.stroke}
                              strokeWidth={elem.shapeStyle.strokeWidth}
                              dash={getDashPattern(elem.shapeStyle.strokeStyle)}
                              opacity={elem.opacity}
                              rotation={elem.rotation}
                              draggable={isDraggable}
                              onClick={(e) => handleElementClick(e, elem.id)}
                              onContextMenu={(e) => handleContextMenu(e, elem.id)}
                              onDragMove={(e) => handleDragMove(e, elem)}
                              onDragEnd={(e) => handleDragEnd(e, elem)}
                              onTransformEnd={(e) => handleTransformEnd(e, elem)}
                            />
                          )}

                          {/* STAR, BADGE, SEAL & MEDAL */}
                          {['star', 'badge', 'seal', 'medal'].includes(elem.shapeStyle.shapeType) && (
                            <Star
                              id={elem.id}
                              x={elem.x + elem.width / 2}
                              y={elem.y + elem.height / 2}
                              numPoints={
                                elem.shapeStyle.shapeType === 'badge' ? 12 : elem.shapeStyle.shapeType === 'seal' || elem.shapeStyle.shapeType === 'medal' ? 16 : elem.shapeStyle.points || 5
                              }
                              innerRadius={
                                (Math.min(elem.width, elem.height) / 2) *
                                (elem.shapeStyle.shapeType === 'seal' ? 0.85 : elem.shapeStyle.shapeType === 'badge' ? 0.75 : elem.shapeStyle.innerRadiusRatio || 0.45)
                              }
                              outerRadius={Math.min(elem.width, elem.height) / 2}
                              fill={elem.shapeStyle.fill === 'transparent' ? undefined : elem.shapeStyle.fill}
                              stroke={elem.shapeStyle.stroke === 'transparent' ? undefined : elem.shapeStyle.stroke}
                              strokeWidth={elem.shapeStyle.strokeWidth}
                              dash={getDashPattern(elem.shapeStyle.strokeStyle)}
                              opacity={elem.opacity}
                              rotation={elem.rotation}
                              draggable={isDraggable}
                              onClick={(e) => handleElementClick(e, elem.id)}
                              onContextMenu={(e) => handleContextMenu(e, elem.id)}
                              onDragMove={(e) => handleDragMove(e, elem)}
                              onDragEnd={(e) => handleDragEnd(e, elem)}
                              onTransformEnd={(e) => handleTransformEnd(e, elem)}
                            />
                          )}

                          {/* POLYGON, HEXAGON & OCTAGON */}
                          {['polygon', 'hexagon', 'octagon'].includes(elem.shapeStyle.shapeType) && (
                            <RegularPolygon
                              id={elem.id}
                              x={elem.x + elem.width / 2}
                              y={elem.y + elem.height / 2}
                              sides={elem.shapeStyle.shapeType === 'octagon' ? 8 : 6}
                              radius={Math.min(elem.width, elem.height) / 2}
                              fill={elem.shapeStyle.fill === 'transparent' ? undefined : elem.shapeStyle.fill}
                              stroke={elem.shapeStyle.stroke === 'transparent' ? undefined : elem.shapeStyle.stroke}
                              strokeWidth={elem.shapeStyle.strokeWidth}
                              dash={getDashPattern(elem.shapeStyle.strokeStyle)}
                              opacity={elem.opacity}
                              rotation={elem.rotation}
                              draggable={isDraggable}
                              onClick={(e) => handleElementClick(e, elem.id)}
                              onContextMenu={(e) => handleContextMenu(e, elem.id)}
                              onDragMove={(e) => handleDragMove(e, elem)}
                              onDragEnd={(e) => handleDragEnd(e, elem)}
                              onTransformEnd={(e) => handleTransformEnd(e, elem)}
                            />
                          )}

                          {/* LINE & ARROW */}
                          {(elem.shapeStyle.shapeType === 'line' || elem.shapeStyle.shapeType === 'arrow') && (
                            <Line
                              id={elem.id}
                              x={elem.x}
                              y={elem.y + elem.height / 2}
                              points={[0, 0, elem.width, 0]}
                              stroke={elem.shapeStyle.stroke || '#0F172A'}
                              strokeWidth={elem.shapeStyle.strokeWidth || 2}
                              dash={getDashPattern(elem.shapeStyle.strokeStyle)}
                              opacity={elem.opacity}
                              rotation={elem.rotation}
                              draggable={isDraggable}
                              onClick={(e) => handleElementClick(e, elem.id)}
                              onContextMenu={(e) => handleContextMenu(e, elem.id)}
                              onDragMove={(e) => handleDragMove(e, elem)}
                              onDragEnd={(e) => handleDragEnd(e, elem)}
                              onTransformEnd={(e) => handleTransformEnd(e, elem)}
                            />
                          )}

                          {/* TRIANGLE */}
                          {elem.shapeStyle.shapeType === 'triangle' && (
                            <Line
                              id={elem.id}
                              x={elem.x}
                              y={elem.y}
                              points={[elem.width / 2, 0, elem.width, elem.height, 0, elem.height]}
                              closed
                              fill={elem.shapeStyle.fill === 'transparent' ? undefined : elem.shapeStyle.fill}
                              stroke={elem.shapeStyle.stroke === 'transparent' ? undefined : elem.shapeStyle.stroke}
                              strokeWidth={elem.shapeStyle.strokeWidth}
                              dash={getDashPattern(elem.shapeStyle.strokeStyle)}
                              opacity={elem.opacity}
                              rotation={elem.rotation}
                              draggable={isDraggable}
                              onClick={(e) => handleElementClick(e, elem.id)}
                              onContextMenu={(e) => handleContextMenu(e, elem.id)}
                              onDragMove={(e) => handleDragMove(e, elem)}
                              onDragEnd={(e) => handleDragEnd(e, elem)}
                              onTransformEnd={(e) => handleTransformEnd(e, elem)}
                            />
                          )}
                        </React.Fragment>
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
                          cropX={elem.imageStyle.cropX}
                          cropY={elem.imageStyle.cropY}
                          cropWidth={elem.imageStyle.cropWidth}
                          cropHeight={elem.imageStyle.cropHeight}
                          cornerRadius={elem.imageStyle.cornerRadius}
                          maskShape={elem.imageStyle.maskShape}
                          borderWidth={elem.imageStyle.borderWidth}
                          borderColor={elem.imageStyle.borderColor}
                          flipH={elem.imageStyle.flipH}
                          flipV={elem.imageStyle.flipV}
                          rotation={elem.rotation}
                          opacity={elem.opacity}
                          draggable={isDraggable}
                          onClick={(e) => handleElementClick(e, elem.id)}
                          onContextMenu={(e) => handleContextMenu(e, elem.id)}
                          onDragStart={() => dispatchFn && dispatchFn({ type: 'SET_SNAP_GUIDES', guides: [] })}
                          onDragMove={(e) => handleDragMove(e, elem)}
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
                          onContextMenu={(e) => handleContextMenu(e, elem.id)}
                          onDragMove={(e) => handleDragMove(e, elem)}
                          onDragEnd={(e) => handleDragEnd(e, elem)}
                          onTransformEnd={(e) => handleTransformEnd(e, elem)}
                        />
                      )}

                      {/* BORDER ELEMENT */}
                      {elem.type === 'border' && (
                        <Group
                          id={elem.id}
                          x={elem.x}
                          y={elem.y}
                          width={elem.width}
                          height={elem.height}
                          rotation={elem.rotation}
                          opacity={elem.opacity}
                          draggable={isDraggable}
                          onClick={(e) => handleElementClick(e, elem.id)}
                          onContextMenu={(e) => handleContextMenu(e, elem.id)}
                          onDragMove={(e) => handleDragMove(e, elem)}
                          onDragEnd={(e) => handleDragEnd(e, elem)}
                          onTransformEnd={(e) => handleTransformEnd(e, elem)}
                        >
                          {/* Outer Border */}
                          <Rect
                            x={0}
                            y={0}
                            width={elem.width}
                            height={elem.height}
                            fill="transparent"
                            stroke={elem.borderStyle?.color || '#1E40AF'}
                            strokeWidth={elem.borderStyle?.width || 3}
                            dash={getDashPattern(elem.borderStyle?.borderType === 'dashed' ? 'dashed' : elem.borderStyle?.borderType === 'dotted' ? 'dotted' : undefined)}
                            cornerRadius={elem.borderStyle?.cornerRadius || 4}
                          />

                          {/* Inner Inset Border for Double / Ornate Styles */}
                          {(elem.borderStyle?.borderType === 'double' || elem.borderStyle?.borderType === 'ornate') && (
                            <Rect
                              x={elem.borderStyle?.inset || 6}
                              y={elem.borderStyle?.inset || 6}
                              width={Math.max(10, elem.width - (elem.borderStyle?.inset || 6) * 2)}
                              height={Math.max(10, elem.height - (elem.borderStyle?.inset || 6) * 2)}
                              fill="transparent"
                              stroke={elem.borderStyle?.color || '#1E40AF'}
                              strokeWidth={Math.max(1, (elem.borderStyle?.width || 3) - 1.5)}
                              cornerRadius={Math.max(0, (elem.borderStyle?.cornerRadius || 4) - 2)}
                            />
                          )}
                        </Group>
                      )}
                    </React.Fragment>
                  );
                })}

              {/* Marquee Selection Rectangle */}
              {isMarqueeActive && marqueeBox && (
                <Rect
                  x={Math.min(marqueeBox.startX, marqueeBox.currentX)}
                  y={Math.min(marqueeBox.startY, marqueeBox.currentY)}
                  width={Math.abs(marqueeBox.currentX - marqueeBox.startX)}
                  height={Math.abs(marqueeBox.currentY - marqueeBox.startY)}
                  fill="rgba(59, 130, 246, 0.12)"
                  stroke="#3B82F6"
                  strokeWidth={1}
                  dash={[4, 4]}
                  listening={false}
                />
              )}

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
                    stroke="#2563EB"
                    strokeWidth={1}
                    dash={[3, 3]}
                    listening={false}
                  />
                ))}

              {/* Konva Transformer with Multi-select and Rotation support */}
              {!isPreviewMode && (
                <Transformer
                  ref={trRef}
                  boundBoxFunc={(oldBox, newBox) => (newBox.width < 10 || newBox.height < 10 ? oldBox : newBox)}
                  anchorFill="#2563EB"
                  anchorStroke="#FFFFFF"
                  anchorStrokeWidth={2}
                  anchorSize={8}
                  anchorCornerRadius={2}
                  borderStroke="#2563EB"
                  borderDash={[4, 4]}
                  rotateAnchorOffset={24}
                />
              )}
            </Layer>
          </Stage>

          {/* Dimension Tooltip during Move/Resize */}
          {transformInfo && (
            <div
              className="absolute pointer-events-none bg-slate-900/90 text-white font-mono text-[10px] px-2 py-0.5 rounded-md shadow-md z-50 transform -translate-y-full -mt-2"
              style={{
                left: transformInfo.x * zoomLevel,
                top: transformInfo.y * zoomLevel,
              }}
            >
              X: {transformInfo.x} Y: {transformInfo.y} · {transformInfo.w}×{transformInfo.h}
              {transformInfo.rot !== 0 ? ` · ${transformInfo.rot}°` : ''}
            </div>
          )}

          {/* Floating Inline Text Editor overlay on double click */}
          {editingElem && !isPreviewMode && (
            <InlineTextEditor
              element={editingElem}
              zoomLevel={zoomLevel}
              showFieldNames={showFieldNames}
              sampleData={sampleData}
              onSave={(val) => {
                if (dispatchFn) {
                  if (editingElem.type === 'dynamic-text') {
                    dispatchFn({
                      type: 'UPDATE_ELEMENT',
                      id: editingElem.id,
                      attrs: { fallbackValue: val },
                      label: `Edit ${editingElem.name}`,
                    });
                  } else {
                    dispatchFn({
                      type: 'UPDATE_ELEMENT',
                      id: editingElem.id,
                      attrs: { textValue: val },
                      label: `Edit ${editingElem.name}`,
                    });
                  }
                } else if (props.onUpdateElement) {
                  props.onUpdateElement(editingElem.id, { textValue: val, fallbackValue: val });
                }
              }}
              onClose={() => setEditingElementId(null)}
            />
          )}
        </div>
      </div>

      {/* Right Click Context Menu */}
      {contextMenuPos && (
        <CanvasContextMenu
          x={contextMenuPos.x}
          y={contextMenuPos.y}
          onClose={() => setContextMenuPos(null)}
        />
      )}
    </div>
  );
};
