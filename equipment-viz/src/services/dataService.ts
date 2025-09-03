import type { Enterprise } from '../types/equipment';

const STORAGE_KEY = 'equipment_enterprise_data';

export class DataService {
  static saveToLocalStorage(enterprise: Enterprise): void {
    try {
      const jsonData = JSON.stringify(enterprise, null, 2);
      localStorage.setItem(STORAGE_KEY, jsonData);
      console.log('Data saved successfully');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  static loadFromLocalStorage(): Enterprise | null {
    try {
      const jsonData = localStorage.getItem(STORAGE_KEY);
      if (jsonData) {
        return JSON.parse(jsonData) as Enterprise;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    return null;
  }

  static exportToJSON(enterprise: Enterprise): void {
    try {
      const jsonData = JSON.stringify(enterprise, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `enterprise_data_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  }

  static async importFromJSON(file: File): Promise<Enterprise | null> {
    try {
      const text = await file.text();
      return JSON.parse(text) as Enterprise;
    } catch (error) {
      console.error('Error importing data:', error);
      return null;
    }
  }

  static clearStorage(): void {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Storage cleared');
  }
}