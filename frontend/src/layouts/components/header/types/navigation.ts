import type { Component } from 'vue';

export interface NavLink {
  label: string;
  to: {
    name: string;
    params?: Record<string, any>;
    hash?: string;
  };
  icon?: Component;
  action?: () => void;
  items?: NavLink[];
}
