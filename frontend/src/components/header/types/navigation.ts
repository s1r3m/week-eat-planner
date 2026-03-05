import type { Component } from 'vue';

export interface NavLink {
  label: string;
  to: string;
  icon?: Component;
  action?: () => void;
  items?: NavLink[];
}
