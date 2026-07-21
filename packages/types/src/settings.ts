export interface WeddingEvent {
  id: string;
  name: string;
  date: string;
  venueId: string;
  description?: string;
}

export interface WeddingVenue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  googleMapsUrl?: string;
}

export interface WeddingSettings {
  id: string;
  brideName: string;
  groomName: string;
  brideShortName?: string;
  groomShortName?: string;
  brideParentNames?: string;
  groomParentNames?: string;
  rsvpDeadline: string;
  rsvpOpen: boolean;
  timezone: string;
  theme: 'dark' | 'light' | 'system';
  primaryColor: string;
  secondaryColor: string;
  qrCodeUrl?: string;
  qrLogoUrl?: string;
  invitationTitleDefault: string;
  invitationWelcomeText?: string;
  events: WeddingEvent[];
  venues: WeddingVenue[];
}
