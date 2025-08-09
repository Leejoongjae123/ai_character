export interface ConsentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConsent: () => void;
}

export interface ConsentState {
  agreed: boolean;
}
