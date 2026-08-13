import { Organization } from '@/types';
import { getItem, setItem } from './repository';

const ORG_KEY = 'organization';

export const defaultOrganization: Organization = {
  id: 'org-abc-college',
  name: 'ABC Engineering College',
  type: 'College / University',
  address: '123 University Road, Guindy, Chennai, Tamil Nadu - 600025',
  email: 'contact@abccollege.edu',
  phone: '+91 44 2235 7000',
  website: 'https://abccollege.edu',
  logoDataUrl: '',
  signatoryName: 'Dr. R. Sundaram',
  signatoryDesignation: 'Principal & Dean of Academics',
  signatureDataUrl: '',
  footerText: 'This certificate is digitally generated and verifiable online via CertifyHub.',
};

export const organizationRepository = {
  get(): Organization {
    return getItem<Organization>(ORG_KEY, defaultOrganization);
  },
  save(org: Organization): boolean {
    return setItem<Organization>(ORG_KEY, org);
  },
};
