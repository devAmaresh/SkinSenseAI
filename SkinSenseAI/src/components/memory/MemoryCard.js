import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import CustomAlert from "../ui/CustomAlert";
import ApiService from "../../services/api";

const getEntryTypeInfo = (entryType) => {
  switch (entryType) {
    case "chat_insight":
      return {
        icon: "chatbubble-outline",
        color: "#00f5ff",
        label: "Chat Insight",
      };
    case "analysis_finding":
      return {
        icon: "flask-outline",
        color: "#8B5CF6",
        label: "Analysis Finding",
      };
    case "user_report":
      return {
        icon: "person-outline",
        color: "#10B981",
        label: "User Report",
      };
    case "reaction_report":
      return {
        icon: "warning-outline",
        color: "#EF4444",
        label: "Reaction Report",
      };
    case "issue_report":
      return {
        icon: "medical-outline",
        color: "#F59E0B",
        label: "Issue Report",
      };
    case "potential_allergen":
      return {
        icon: "alert-circle-outline",
        color: "#FF6B35",
        label: "Potential Allergen",
      };
    default:
      return {
        icon: "document-outline",
        color: "#6B7280",
        label: "Memory",
      };
  }
};

const getImportanceLevel = (importance) => {
  if (importance >= 5) return { label: "Critical", color: "#EF4444" };
  if (importance >= 4) return { label: "High", color: "#F59E0B" };
  if (importance >= 3) return { label: "Medium", color: "#00f5ff" };
  if (importance >= 2) return { label: "Low", color: "#10B981" };
  return { label: "Info", color: "#6B7280" };
};

const getSuitabilityColor = (score) => {
  if (score >= 8) return "#00ff88";
  if (score >= 6) return "#ffaa00";
  if (score >= 4) return "#ff6600";
  return "#ff4444";
};

const MemoryCard = ({ memory, onDelete }) => {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const entryInfo = getEntryTypeInfo(memory.entry_type);
  const importanceInfo = getImportanceLevel(memory.importance);

  // Check if this is an analysis finding with analysis_result
  const isAnalysisResult =
    memory.entry_type === "analysis_finding" &&
    memory.entry_metadata?.analysis_result;

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return "Today";
      if (diffDays === 2) return "Yesterday";
      if (diffDays <= 7) return `${diffDays - 1} days ago`;

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    } catch {
      return "Unknown date";
    }
  };

  const formatValue = (key, value) => {
    if (value === null || value === undefined) return "N/A";

    if (Array.isArray(value)) {
      if (value.length === 0) return "None";
      return value.join(", ");
    }

    if (typeof value === "object") {
      return "[Complex Data]";
    }

    return String(value);
  };

  const handleDeletePress = () => {
    setShowDeleteAlert(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await ApiService.deleteMemoryEntry(memory.id);
      setShowDeleteAlert(false);
      
      // Immediately call the onDelete callback to update the parent component's state
      if (onDelete) {
        onDelete(memory.id);
      }
    } catch (error) {
      console.error("Failed to delete memory:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderAnalysisResult = (analysisResult) => {
    return (
      <View className="mt-3">
        {/* Product Info */}
        <View
          className="rounded-2xl p-4 mb-3"
          style={{
            backgroundColor: "rgba(139, 92, 246, 0.05)",
            borderWidth: 1,
            borderColor: "rgba(139, 92, 246, 0.1)",
          }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white text-lg font-semibold">
              {analysisResult.product_name || "Unknown Product"}
            </Text>
            {analysisResult.suitability_score !== undefined && (
              <View
                className="px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${getSuitabilityColor(
                    analysisResult.suitability_score
                  )}20`,
                  borderWidth: 1,
                  borderColor: `${getSuitabilityColor(
                    analysisResult.suitability_score
                  )}40`,
                }}
              >
                <Text
                  className="text-sm font-bold"
                  style={{
                    color: getSuitabilityColor(
                      analysisResult.suitability_score
                    ),
                  }}
                >
                  {analysisResult.suitability_score}/10
                </Text>
              </View>
            )}
          </View>

          {analysisResult.brand && (
            <Text className="text-gray-400 text-sm mb-2">
              Brand: {analysisResult.brand}
            </Text>
          )}

          {analysisResult.product_type && (
            <Text className="text-gray-400 text-sm mb-3">
              Type: {analysisResult.product_type}
            </Text>
          )}

          {/* Recommendation */}
          {analysisResult.personalized_recommendation && (
            <View className="mb-3">
              <Text className="text-cyan-400 text-sm font-medium mb-1">
                Recommendation:
              </Text>
              <Text className="text-gray-300 text-sm leading-5">
                {analysisResult.personalized_recommendation}
              </Text>
            </View>
          )}

          {/* Allergen Warnings */}
          {analysisResult.allergen_warnings &&
            analysisResult.allergen_warnings.length > 0 && (
              <View className="mb-3">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="warning-outline" size={16} color="#ff6600" />
                  <Text className="text-orange-400 text-sm font-medium ml-2">
                    Allergen Warnings:
                  </Text>
                </View>
                {analysisResult.allergen_warnings.map((warning, index) => (
                  <Text
                    key={index}
                    className="text-orange-300 text-sm mb-1 leading-5"
                  >
                    • {warning}
                  </Text>
                ))}
              </View>
            )}

          {/* Expandable Details */}

          {/* Expanded Details */}

          <View className="mt-3 pt-3 border-t border-gray-800">
            {/* Beneficial Ingredients */}
            {analysisResult.beneficial_ingredients &&
              analysisResult.beneficial_ingredients.length > 0 && (
                <View className="mb-3">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="leaf-outline" size={16} color="#00ff88" />
                    <Text className="text-green-400 text-sm font-medium ml-2">
                      Beneficial Ingredients:
                    </Text>
                  </View>
                  {analysisResult.beneficial_ingredients.map(
                    (ingredient, index) => (
                      <Text
                        key={index}
                        className="text-green-300 text-sm mb-1 leading-5"
                      >
                        • {ingredient}
                      </Text>
                    )
                  )}
                </View>
              )}

            {/* Watch Ingredients */}
            {analysisResult.watch_ingredients &&
              analysisResult.watch_ingredients.length > 0 && (
                <View className="mb-3">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="eye-outline" size={16} color="#ffaa00" />
                    <Text className="text-yellow-400 text-sm font-medium ml-2">
                      Watch Ingredients:
                    </Text>
                  </View>
                  {analysisResult.watch_ingredients.map((ingredient, index) => (
                    <View key={index} className="flex-row items-start">
                      <Ionicons name="warning" size={16} color="#ffaa00" style={{ marginTop: 2 }} />
                      <View className="ml-2 flex-1">
                        <Text className="text-yellow-300 text-sm mb-1 leading-5">
                          • {typeof ingredient === 'string' ? ingredient : ingredient.name}
                        </Text>
                        {typeof ingredient !== 'string' && ingredient.reason && (
                          <Text className="text-gray-400 text-xs mb-2 ml-2">
                            {ingredient.reason}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}

            {/* Key Ingredients */}
            {analysisResult.key_ingredients &&
              analysisResult.key_ingredients.length > 0 && (
                <View className="mb-3">
                  <Text className="text-gray-400 text-sm font-medium mb-2">
                    Key Ingredients:
                  </Text>
                  <View className="flex-row flex-wrap">
                    {analysisResult.key_ingredients
                      .slice(0, 6)
                      .map((ingredient, index) => (
                        <View
                          key={index}
                          className="rounded-full px-2 py-1 mr-2 mb-1"
                          style={{
                            backgroundColor: "rgba(0, 245, 255, 0.1)",
                            borderWidth: 1,
                            borderColor: "rgba(0, 245, 255, 0.2)",
                          }}
                        >
                          <Text className="text-cyan-400 text-xs">
                            {typeof ingredient === 'string'
                              ? (ingredient.length > 20 ? ingredient.substring(0, 20) + "..." : ingredient)
                              : (ingredient && ingredient.name 
                                  ? (ingredient.name.length > 20 ? ingredient.name.substring(0, 20) + "..." : ingredient.name)
                                  : "Unknown")}
                          </Text>
                        </View>
                      ))}
                    {analysisResult.key_ingredients.length > 6 && (
                      <Text className="text-gray-400 text-xs mt-1">
                        +{analysisResult.key_ingredients.length - 6} more
                      </Text>
                    )}
                  </View>
                </View>
              )}

            {/* Usage Instructions */}
            {analysisResult.usage_instructions && (
              <View className="mb-3">
                <Text className="text-gray-400 text-sm font-medium mb-1">
                  Usage Instructions:
                </Text>
                <Text className="text-gray-300 text-sm leading-5">
                  {analysisResult.usage_instructions}
                </Text>
              </View>
            )}

            {/* Potential Issues */}
            {analysisResult.potential_issues && (
                <View className="mb-3">
                  <View className="flex-row items-center mb-2">
                    <Ionicons
                      name="alert-circle-outline"
                      size={16}
                      color="#ff4444"
                    />
                    <Text className="text-red-400 text-sm font-medium ml-2">
                      Potential Issues:
                    </Text>
                  </View>
                  {typeof analysisResult.potential_issues === 'string' ? (
                    <Text className="text-red-300 text-sm mb-1 leading-5">
                      • {analysisResult.potential_issues}
                    </Text>
                  ) : Array.isArray(analysisResult.potential_issues) ? (
                    analysisResult.potential_issues.map((issue, index) => (
                      <Text
                        key={index}
                        className="text-red-300 text-sm mb-1 leading-5"
                      >
                        • {issue}
                      </Text>
                    ))
                  ) : null}
                </View>
              )}
          </View>
        </View>
      </View>
    );
  };

  const renderRegularMetadata = (metadata) => {
    const filteredMetadata = Object.entries(metadata).filter(
      ([key]) => key !== "analysis_result"
    );

    if (filteredMetadata.length === 0) return null;

    return (
      <View className="pt-3 border-t border-gray-800">
        <Text className="text-gray-500 text-xs mb-2">Additional Details:</Text>
        {filteredMetadata.map(([key, value]) => (
          <View key={key} className="flex-row mb-1">
            <Text className="text-gray-400 text-xs capitalize w-20">
              {key.replace(/_/g, " ")}:
            </Text>
            <Text className="text-gray-300 text-xs flex-1">
              {formatValue(key, value)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <>
      <View
        className="rounded-2xl p-4 mb-3"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Header */}
        <View className="flex-row items-center mb-3">
          <View
            className="w-8 h-8 rounded-full items-center justify-center mr-3"
            style={{
              backgroundColor: `${entryInfo.color}20`,
              borderWidth: 1,
              borderColor: `${entryInfo.color}40`,
            }}
          >
            <Ionicons name={entryInfo.icon} size={16} color={entryInfo.color} />
          </View>

          <View className="flex-1">
            <Text className="text-white text-sm font-medium">
              {entryInfo.label}
            </Text>
            <Text className="text-gray-500 text-xs">
              {formatDate(memory.created_at)}
            </Text>
          </View>

          <View className="flex-row items-center space-x-2">
            <View
              className="rounded-full px-2 py-1"
              style={{
                backgroundColor: `${importanceInfo.color}20`,
                borderWidth: 1,
                borderColor: `${importanceInfo.color}40`,
              }}
            >
              <Text
                className="text-xs font-medium"
                style={{ color: importanceInfo.color }}
              >
                {importanceInfo.label}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleDeletePress}
              disabled={isDeleting}
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{
                backgroundColor: "rgba(255, 68, 68, 0.1)",
                borderWidth: 1,
                borderColor: "rgba(255, 68, 68, 0.2)",
                opacity: isDeleting ? 0.6 : 1,
              }}
            >
              {isDeleting ? (
                <Ionicons name="refresh" size={14} color="#ff4444" />
              ) : (
                <Ionicons name="trash-outline" size={14} color="#ff4444" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <Text className="text-gray-300 text-sm leading-5 mb-3">
          {memory.content}
        </Text>

        {/* Analysis Result or Regular Metadata */}
        {isAnalysisResult ? (
          <View>
            <TouchableOpacity
              onPress={() => setIsExpanded(!isExpanded)}
              className="flex-row items-center justify-center py-2"
            >
              <Text className="text-cyan-400 text-sm font-medium mr-2">
                {isExpanded ? "Show Less" : "Show More Details"}
              </Text>
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={16}
                color="#00f5ff"
              />
            </TouchableOpacity>
            {isExpanded &&
              renderAnalysisResult(memory.entry_metadata.analysis_result)}
          </View>
        ) : (
          memory.entry_metadata &&
          Object.keys(memory.entry_metadata).length > 0 &&
          renderRegularMetadata(memory.entry_metadata)
        )}

        {/* Source */}
        {memory.source && (
          <View className="flex-row items-center mt-2">
            <Ionicons name="link-outline" size={12} color="#6B7280" />
            <Text className="text-gray-500 text-xs ml-1">
              Source: {memory.source}
            </Text>
          </View>
        )}
      </View>

      <CustomAlert
        visible={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        title="Delete Memory Forever"
        message={`Permanently delete this ${entryInfo.label.toLowerCase()}? This will remove all data from our servers and cannot be recovered.`}
        type="danger"
        confirmText="Delete"
        cancelText="Keep"
        showCancel={true}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </>
  );
};

export default MemoryCard;
