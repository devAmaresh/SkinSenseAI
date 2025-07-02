import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/api';

const SkinMemoryContext = createContext();

export const useSkinMemory = () => {
  const context = useContext(SkinMemoryContext);
  if (!context) {
    throw new Error('useSkinMemory must be used within a SkinMemoryProvider');
  }
  return context;
};

export const SkinMemoryProvider = ({ children }) => {
  const [allergens, setAllergens] = useState([]);
  const [skinIssues, setSkinIssues] = useState([]);
  const [memories, setMemories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAllergens = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.getUserAllergens();
      setAllergens(response.allergens || []);
      setError(null);
    } catch (error) {
      console.error('Load allergens error:', error);
      setError('Failed to load allergens');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSkinIssues = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.getSkinIssues();
      setSkinIssues(response.issues || []);
      setError(null);
    } catch (error) {
      console.error('Load skin issues error:', error);
      setError('Failed to load skin issues');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMemories = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.getMemories();
      setMemories(response.memories || []);
      setError(null);
    } catch (error) {
      console.error('Load memories error:', error);
      setError('Failed to load memories');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.getSkinMemorySummary();
      setSummary(response);
      setError(null);
    } catch (error) {
      console.error('Load summary error:', error);
      setError('Failed to load summary');
    } finally {
      setIsLoading(false);
    }
  };

  const addAllergen = async (allergenData) => {
    try {
      const response = await ApiService.addAllergen(allergenData);
      await loadAllergens(); // Refresh the list
      return response;
    } catch (error) {
      console.error('Add allergen error:', error);
      throw error;
    }
  };

  const updateAllergen = async (allergenId, allergenData) => {
    try {
      const response = await ApiService.updateAllergen(allergenId, allergenData);
      await loadAllergens(); // Refresh the list
      return response;
    } catch (error) {
      console.error('Update allergen error:', error);
      throw error;
    }
  };

  const removeAllergen = async (allergenId) => {
    try {
      const response = await ApiService.removeAllergen(allergenId);
      await loadAllergens(); // Refresh the list
      return response;
    } catch (error) {
      console.error('Remove allergen error:', error);
      throw error;
    }
  };

  const addSkinIssue = async (issueData) => {
    try {
      const response = await ApiService.addSkinIssue(issueData);
      await loadSkinIssues(); // Refresh the list
      return response;
    } catch (error) {
      console.error('Add skin issue error:', error);
      throw error;
    }
  };

  const updateSkinIssue = async (issueId, issueData) => {
    try {
      const response = await ApiService.updateSkinIssue(issueId, issueData);
      await loadSkinIssues(); // Refresh the list
      return response;
    } catch (error) {
      console.error('Update skin issue error:', error);
      throw error;
    }
  };

  const refreshAll = async () => {
    await Promise.all([
      loadAllergens(),
      loadSkinIssues(),
      loadMemories(),
      loadSummary()
    ]);
  };

  const value = {
    allergens,
    skinIssues,
    memories,
    summary,
    isLoading,
    error,
    loadAllergens,
    loadSkinIssues,
    loadMemories,
    loadSummary,
    addAllergen,
    updateAllergen,
    removeAllergen,
    addSkinIssue,
    updateSkinIssue,
    refreshAll,
  };

  return (
    <SkinMemoryContext.Provider value={value}>
      {children}
    </SkinMemoryContext.Provider>
  );
};