import React from 'react';

interface PhysiotherapyIconProps {
  className?: string;
}

/**
 * Authentic Physiotherapy / Physical Rehabilitation Icon
 * Depicts a physiotherapist administering manual therapy & rehabilitation
 * to a patient lying on a clinical examination plinth.
 */
export const PhysiotherapyIcon: React.FC<PhysiotherapyIconProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    {/* Treatment Bed / Plinth Surface Cushion */}
    <rect x="2.5" y="14.8" width="19" height="1.6" rx="0.3" />
    
    {/* Bed Legs & Stability Frame */}
    <path d="M4 16.4V20.5H5.8V17.5H18.2V20.5H20V16.4H4Z" />

    {/* Patient Lying on Plinth */}
    <circle cx="5.5" cy="11.2" r="1.5" />
    <path d="M7 12.4L9 11.2L18.5 13.8V14.8H8.5L7 12.4Z" />
    <path
      d="M7.8 12.8L6.4 14.8H8.6L9.4 13.6"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Physiotherapist Administering Manual Therapy */}
    <circle cx="12.5" cy="4.8" r="1.6" />
    <path d="M10.8 7.2H14.2L15.6 10.2L13.8 11.5H11.2L9.4 10.2Z" />
    <path
      d="M10.2 8.4L8.4 11.2L11.6 12.6"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M14.8 8.4L16.6 11.2L13.4 12.6"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export default PhysiotherapyIcon;
