import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';

// Components
import { Skeleton } from '../components/Skeleton';
import AllergenCard from '../components/memory/AllergenCard';
import SkinIssueCard from '../components/memory/SkinIssueCard';
import MemoryCard from '../components/memory/MemoryCard';
import EmptyState from '../components/memory/EmptyState';
import AllergenForm from '../components/forms/AllergenForm';
import SkinIssueForm from '../components/forms/SkinIssueForm';

// Services
import ApiService from '../services/api';

export default function SkinMemoryScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('allergens');
  const [allergens, setAllergens] = useState([]);
  const [skinIssues, setSkinIssues] = useState([]);
  const [memories, setMemories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Modal states
  const [showAddAllergenModal, setShowAddAllergenModal] = useState(false);
  const [showAddIssueModal, setShowAddIssueModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadAllergens(),
        loadSkinIssues(),
        loadMemories()
      ]);
    } catch (error) {
      console.error('Error loading skin memory data:', error);
      Alert.alert('Error', 'Failed to load your skin memory data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllergens = async () => {
    try {
      const response = await ApiService.getUserAllergens();
      setAllergens(response || []);
    } catch (error) {
      console.error('Error loading allergens:', error);
    }
  };

  const loadSkinIssues = async () => {
    try {
      const response = await ApiService.getSkinIssues();
      setSkinIssues(response || []);
    } catch (error) {
      console.error('Error loading skin issues:', error);
    }
  };

  const loadMemories = async () => {
    try {
      const response = await ApiService.getMemories();
      setMemories(response || []);
    } catch (error) {
      console.error('Error loading memories:', error);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleSaveAllergen = async (allergenData) => {
    try {
      if (editingItem) {
        await ApiService.updateAllergen(editingItem.id, allergenData);
        Alert.alert('Success', 'Allergen updated successfully');
      } else {
        await ApiService.addAllergen(allergenData);
        Alert.alert('Success', 'Allergen added successfully');
      }
      
      setShowAddAllergenModal(false);
      setEditingItem(null);
      await loadAllergens();
    } catch (error) {
      console.error('Error saving allergen:', error);
      Alert.alert('Error', 'Failed to save allergen');
    }
  };

  const handleSaveSkinIssue = async (issueData) => {
    try {
      if (editingItem) {
        await ApiService.updateSkinIssue(editingItem.id, issueData);
        Alert.alert('Success', 'Skin issue updated successfully');
      } else {
        await ApiService.addSkinIssue(issueData);
        Alert.alert('Success', 'Skin issue added successfully');
      }
      
      setShowAddIssueModal(false);
      setEditingItem(null);
      await loadSkinIssues();
    } catch (error) {
      console.error('Error saving skin issue:', error);
      Alert.alert('Error', 'Failed to save skin issue');
    }
  };

  const handleDeleteAllergen = (allergen) => {
    Alert.alert(
      'Remove Allergen',
      `Are you sure you want to remove "${allergen.ingredient_name}" from your allergens list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.removeAllergen(allergen.id);
              Alert.alert('Success', 'Allergen removed successfully');
              await loadAllergens();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove allergen');
            }
          }
        }
      ]
    );
  };

  const handleEditAllergen = (allergen) => {
    setEditingItem(allergen);
    setShowAddAllergenModal(true);
  };

  const handleEditSkinIssue = (issue) => {
    setEditingItem(issue);
    setShowAddIssueModal(true);
  };

  const handleUpdateIssueStatus = async (issue, newStatus) => {
    try {
      await ApiService.updateSkinIssue(issue.id, { status: newStatus });
      Alert.alert('Success', `Issue marked as ${newStatus}`);
      await loadSkinIssues();
    } catch (error) {
      Alert.alert('Error', 'Failed to update issue status');
    }
  };

  const renderTabs = () => (
    <View className="flex-row mb-6">
      {[
        { key: 'allergens', label: 'Allergens', icon: 'warning-outline' },
        { key: 'issues', label: 'Skin Issues', icon: 'medical-outline' },
        { key: 'memories', label: 'Memories', icon: 'library-outline' }
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => setActiveTab(tab.key)}
          className="flex-1 py-3 px-4 rounded-2xl mx-1"
          style={{
            backgroundColor: activeTab === tab.key 
              ? 'rgba(0, 245, 255, 0.1)' 
              : 'rgba(255, 255, 255, 0.03)',
            borderWidth: 1,
            borderColor: activeTab === tab.key 
              ? 'rgba(0, 245, 255, 0.3)' 
              : 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <View className="items-center">
            <Ionicons 
              name={tab.icon} 
              size={20} 
              color={activeTab === tab.key ? '#00f5ff' : 'rgba(255,255,255,0.6)'} 
            />
            <Text 
              className={`text-xs mt-1 font-medium ${
                activeTab === tab.key ? 'text-cyan-400' : 'text-gray-400'
              }`}
            >
              {tab.label}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderAllergens = () => (
    <View>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-semibold text-white">Your Allergens</Text>
        <TouchableOpacity
          onPress={() => setShowAddAllergenModal(true)}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 245, 255, 0.1)',
            borderWidth: 1,
            borderColor: 'rgba(0, 245, 255, 0.2)',
          }}
        >
          <Ionicons name="add" size={20} color="#00f5ff" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <View
              key={index}
              className="rounded-2xl p-4"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <View className="flex-row justify-between items-start mb-2">
                <Skeleton width="60%" height={20} borderRadius={10} />
                <Skeleton width={60} height={20} borderRadius={10} />
              </View>
              <Skeleton width="80%" height={16} borderRadius={8} style={{ marginBottom: 8 }} />
              <Skeleton width="40%" height={14} borderRadius={7} />
            </View>
          ))}
        </View>
      ) : allergens.length === 0 ? (
        <EmptyState
          type="allergens"
          title="No allergens tracked"
          description="Add ingredients you're allergic to for personalized product analysis"
        />
      ) : (
        <View>
          {allergens.map((allergen) => (
            <AllergenCard
              key={allergen.id}
              allergen={allergen}
              onEdit={handleEditAllergen}
              onDelete={handleDeleteAllergen}
            />
          ))}
        </View>
      )}
    </View>
  );

  const renderSkinIssues = () => (
    <View>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-semibold text-white">Skin Issues</Text>
        <TouchableOpacity
          onPress={() => setShowAddIssueModal(true)}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 245, 255, 0.1)',
            borderWidth: 1,
            borderColor: 'rgba(0, 245, 255, 0.2)',
          }}
        >
          <Ionicons name="add" size={20} color="#00f5ff" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <View
              key={index}
              className="rounded-2xl p-4"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <View className="flex-row justify-between items-start mb-2">
                <Skeleton width="50%" height={20} borderRadius={10} />
                <Skeleton width={60} height={20} borderRadius={10} />
              </View>
              <Skeleton width="100%" height={16} borderRadius={8} style={{ marginBottom: 8 }} />
              <Skeleton width="70%" height={16} borderRadius={8} style={{ marginBottom: 8 }} />
              <Skeleton width="40%" height={14} borderRadius={7} />
            </View>
          ))}
        </View>
      ) : skinIssues.length === 0 ? (
        <EmptyState
          type="issues"
          title="No issues tracked"
          description="Track your skin concerns to get better personalized recommendations"
        />
      ) : (
        <View>
          {skinIssues.map((issue) => (
            <SkinIssueCard
              key={issue.id}
              issue={issue}
              onEdit={handleEditSkinIssue}
              onUpdateStatus={handleUpdateIssueStatus}
            />
          ))}
        </View>
      )}
    </View>
  );

  const renderMemories = () => (
    <View>
      <Text className="text-xl font-semibold text-white mb-4">Skin Memory</Text>
      
      {isLoading ? (
        <View className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <View
              key={index}
              className="rounded-2xl p-4"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <View className="flex-row items-center mb-2">
                <Skeleton width={20} height={20} borderRadius={10} style={{ marginRight: 8 }} />
                <Skeleton width="40%" height={16} borderRadius={8} />
              </View>
              <Skeleton width="100%" height={16} borderRadius={8} style={{ marginBottom: 4 }} />
              <Skeleton width="80%" height={16} borderRadius={8} style={{ marginBottom: 8 }} />
              <Skeleton width="30%" height={12} borderRadius={6} />
            </View>
          ))}
        </View>
      ) : memories.length === 0 ? (
        <EmptyState
          type="memories"
          title="No memories yet"
          description="Your AI will remember important insights from product analyses and chats"
        />
      ) : (
        <View>
          {memories.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} />
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#000000' }}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#000000']}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#00f5ff"
              colors={['#00f5ff']}
            />
          }
        >
          {/* Header */}
          <View className="px-6 pt-1 pb-6">
            <View className="flex-row items-center justify-between mb-6">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Home')}
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{
                  backgroundColor: 'rgba(0, 245, 255, 0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(0, 245, 255, 0.2)',
                }}
              >
                <Ionicons name="home" size={24} color="#00f5ff" />
              </TouchableOpacity>
            </View>

            <Text className="text-3xl font-bold text-white mb-2">
              Skin Memory
            </Text>
            <Text className="text-gray-300 text-lg">
              Your personalized skin care history
            </Text>
          </View>

          <View className="px-6">
            {renderTabs()}
            
            {activeTab === 'allergens' && renderAllergens()}
            {activeTab === 'issues' && renderSkinIssues()}
            {activeTab === 'memories' && renderMemories()}
          </View>
        </ScrollView>

        {/* Add Allergen Modal */}
        <Modal
          visible={showAddAllergenModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            setShowAddAllergenModal(false);
            setEditingItem(null);
          }}
        >
          <View className="flex-1 justify-end">
            <AllergenForm
              allergen={editingItem}
              onSave={handleSaveAllergen}
              onCancel={() => {
                setShowAddAllergenModal(false);
                setEditingItem(null);
              }}
            />
          </View>
        </Modal>

        {/* Add Skin Issue Modal */}
        <Modal
          visible={showAddIssueModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            setShowAddIssueModal(false);
            setEditingItem(null);
          }}
        >
          <View className="flex-1 justify-end">
            <SkinIssueForm
              issue={editingItem}
              onSave={handleSaveSkinIssue}
              onCancel={() => {
                setShowAddIssueModal(false);
                setEditingItem(null);
              }}
            />
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}