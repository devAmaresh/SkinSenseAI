import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import CustomAlert from '../ui/CustomAlert';
import ApiService from '../../services/api';

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return '#EF4444'; // red
    case 'improving':
      return '#F59E0B'; // amber
    case 'resolved':
      return '#10B981'; // green
    default:
      return '#6B7280'; // gray
  }
};

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'alert-circle';
    case 'improving':
      return 'trending-up';
    case 'resolved':
      return 'checkmark-circle';
    default:
      return 'help-circle';
  }
};

const getSeverityLevel = (severity) => {
  if (severity >= 8) return { label: 'Severe', color: '#EF4444' };
  if (severity >= 5) return { label: 'Moderate', color: '#F59E0B' };
  if (severity >= 3) return { label: 'Mild', color: '#10B981' };
  return { label: 'Very Mild', color: '#6B7280' };
};

export default function SkinIssueCard({ issue, onEdit, onUpdateStatus, onDelete }) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showStatusAlert, setShowStatusAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [nextStatus, setNextStatus] = useState('');

  const statusColor = getStatusColor(issue.status);
  const statusIcon = getStatusIcon(issue.status);
  const severityInfo = getSeverityLevel(issue.severity);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'active': return 'improving';
      case 'improving': return 'resolved';
      case 'resolved': return 'active';
      default: return 'improving';
    }
  };

  const getStatusActionText = (currentStatus) => {
    switch (currentStatus) {
      case 'active': return 'Mark Improving';
      case 'improving': return 'Mark Resolved';
      case 'resolved': return 'Mark Active';
      default: return 'Update Status';
    }
  };

  const handleDeletePress = () => {
    setShowDeleteAlert(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await ApiService.deleteSkinIssue(issue.id);
      setShowDeleteAlert(false);
      onDelete?.(issue.id);
    } catch (error) {
      console.error('Failed to delete skin issue:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusUpdate = () => {
    const next = getNextStatus(issue.status);
    setNextStatus(next);
    setShowStatusAlert(true);
  };

  const handleConfirmStatusUpdate = async () => {
    try {
      setIsUpdatingStatus(true);
      const updatedIssue = await ApiService.updateIssueStatus(issue.id, nextStatus);
      setShowStatusAlert(false);
      onUpdateStatus?.(updatedIssue);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <>
      <View
        className="rounded-2xl p-4 mb-3"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-white text-lg font-semibold capitalize">
              {issue.issue_type}
            </Text>
            <View className="flex-row items-center mt-1">
              <Ionicons 
                name={statusIcon} 
                size={16} 
                color={statusColor} 
              />
              <Text 
                className="text-sm font-medium ml-1 capitalize"
                style={{ color: statusColor }}
              >
                {issue.status}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center space-x-2">
            <TouchableOpacity
              onPress={() => onEdit(issue)}
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{
                backgroundColor: 'rgba(0, 245, 255, 0.1)',
                borderWidth: 1,
                borderColor: 'rgba(0, 245, 255, 0.2)',
              }}
            >
              <Ionicons name="pencil" size={16} color="#00f5ff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDeletePress}
              disabled={isDeleting}
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{
                backgroundColor: 'rgba(255, 68, 68, 0.1)',
                borderWidth: 1,
                borderColor: 'rgba(255, 68, 68, 0.2)',
                opacity: isDeleting ? 0.6 : 1,
              }}
            >
              {isDeleting ? (
                <Ionicons name="refresh" size={16} color="#ff4444" />
              ) : (
                <Ionicons name="trash-outline" size={16} color="#ff4444" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        {issue.description && (
          <Text className="text-gray-300 text-sm mb-3">
            {issue.description}
          </Text>
        )}

        {/* Severity */}
        <View className="flex-row items-center mb-3">
          <Text className="text-gray-400 text-sm mr-2">Severity:</Text>
          <View className="flex-row items-center">
            <View className="flex-row mr-2">
              {Array.from({ length: 10 }).map((_, index) => (
                <View
                  key={index}
                  className="w-2 h-2 rounded-full mr-1"
                  style={{
                    backgroundColor: index < issue.severity 
                      ? severityInfo.color 
                      : 'rgba(255, 255, 255, 0.1)'
                  }}
                />
              ))}
            </View>
            <Text 
              className="text-sm font-medium"
              style={{ color: severityInfo.color }}
            >
              {issue.severity}/10 ({severityInfo.label})
            </Text>
          </View>
        </View>

        {/* Triggers */}
        {issue.triggers && issue.triggers.length > 0 && (
          <View className="mb-3">
            <Text className="text-gray-400 text-sm mb-1">Triggers:</Text>
            <View className="flex-row flex-wrap">
              {issue.triggers.map((trigger, index) => (
                <View
                  key={index}
                  className="rounded-full px-2 py-1 mr-2 mb-1"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 1,
                    borderColor: 'rgba(239, 68, 68, 0.2)',
                  }}
                >
                  <Text className="text-red-400 text-xs">{trigger}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-500 text-xs">
            Since {formatDate(issue.first_reported)}
          </Text>

          <TouchableOpacity
            onPress={handleStatusUpdate}
            disabled={isUpdatingStatus}
            className="rounded-full px-3 py-1"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderWidth: 1,
              borderColor: 'rgba(16, 185, 129, 0.2)',
              opacity: isUpdatingStatus ? 0.6 : 1,
            }}
          >
            <View className="flex-row items-center">
              {isUpdatingStatus && (
                <Ionicons name="refresh" size={12} color="#10B981" style={{ marginRight: 4 }} />
              )}
              <Text className="text-green-400 text-xs font-medium">
                {isUpdatingStatus ? 'Updating...' : getStatusActionText(issue.status)}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Delete Confirmation */}
      <CustomAlert
        visible={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        title="Delete Skin Issue Forever"
        message={`Permanently delete "${issue.issue_type}" and all its history? This action cannot be undone and will remove all associated data from our servers.`}
        type="danger"
        confirmText="Delete"
        cancelText="Keep"
        showCancel={true}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />

      {/* Status Update Confirmation */}
      <CustomAlert
        visible={showStatusAlert}
        onClose={() => setShowStatusAlert(false)}
        title="Update Status"
        message={`Mark "${issue.issue_type}" as ${nextStatus}?`}
        type="info"
        confirmText={`Mark ${nextStatus}`}
        cancelText="Cancel"
        showCancel={true}
        onConfirm={handleConfirmStatusUpdate}
        isLoading={isUpdatingStatus}
      />
    </>
  );
}