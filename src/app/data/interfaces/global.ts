export interface CalendarEvent {
  start: Date;
  index?: number;
  end: Date;
  title?: string;
  description?: string;
  type?: number;
  serviceId?: number;
  groupId?: number;
  groupName?: string;
  mode?: number;
  allDay: boolean;
  draggable: boolean;
  resizable: {
    beforeStart: boolean;
    afterEnd: false;
  };
  patternDay?: number; // The current day number in the pattern (1-based)
  patternCycle?: number; // Which cycle through the pattern this event is in
}

export interface searchOptions {
  base?: string;
  filter?: any;
  itemsKey?: string;
  itemsKeys?: string[];
  keys?: string[];
  query?: string;
  results?: any[];
  search_categories?: boolean;
  search_companies?: boolean;
  search_events?: boolean;
  search_groups?: boolean;
  search_job_posts?: boolean;
  search_people?: boolean;
  search_posts?: boolean;
  search_products?: boolean;
  suggestions?: any[];
  type?: string;
  uid?: number;
  visible?: boolean;
}

//interfaces
export interface Plan {
  id?: any;
  name?: any;
  local?: boolean;
  public?: boolean;
  pattern: any[];
  groups: Group[];
  services: Service[];
  type?: any;
  countryId?: any;
}

export interface Group {
  id?: number;
  name: string;
  type?: string;
  start: string;
}

export interface Service {
  id?: number;
  name: string;
  description?: string;
  type?: string;
  disabled?: boolean; 
}

export interface Shift {
  id?: number;
  name: string;
  service: number;
}
export interface Pattern {
  group: Group, 
    
}
