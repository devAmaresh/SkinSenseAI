import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';

const skinTypeQuestions = [
  {
    id: 1,
    question: "How does your skin typically feel after cleansing?",
    options: [
      { id: 'a', text: 'Tight and dry', icon: 'water-outline' },
      { id: 'b', text: 'Comfortable and balanced', icon: 'checkmark-circle-outline' },
      { id: 'c', text: 'Oily, especially in T-zone', icon: 'ellipse-outline' },
      { id: 'd', text: 'Very oily all over', icon: 'ellipse' }
    ]
  },
  {
    id: 2,
    question: "How often do you experience breakouts?",
    options: [
      { id: 'a', text: 'Rarely or never', icon: 'happy-outline' },
      { id: 'b', text: 'Occasionally', icon: 'sad-outline' },
      { id: 'c', text: 'Frequently', icon: 'alert-circle-outline' },
      { id: 'd', text: 'Almost constantly', icon: 'warning-outline' }
    ]
  },
  {
    id: 3,
    question: "How does your skin react to new products?",
    options: [
      { id: 'a', text: 'Very sensitive, often reacts', icon: 'flame-outline' },
      { id: 'b', text: 'Sometimes sensitive', icon: 'leaf-outline' },
      { id: 'c', text: 'Generally tolerant', icon: 'shield-outline' },
      { id: 'd', text: 'Very tolerant, rarely reacts', icon: 'shield-checkmark-outline' }
    ]
  },
  {
    id: 4,
    question: "How does your skin look by midday?",
    options: [
      { id: 'a', text: 'Still looks fresh', icon: 'sparkles-outline' },
      { id: 'b', text: 'Slightly shiny in T-zone', icon: 'sunny-outline' },
      { id: 'c', text: 'Noticeably oily', icon: 'water' },
      { id: 'd', text: 'Very shiny and oily', icon: 'flashlight-outline' }
    ]
  }
];

export default function SkinTypeQuestionsScreen({ navigation }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
  };

  const handleNext = () => {
    if (!selectedOption) {
      Alert.alert('Please select an option', 'Choose the option that best describes your skin.');
      return;
    }

    const newAnswers = {
      ...answers,
      [skinTypeQuestions[currentQuestion].id]: selectedOption
    };
    setAnswers(newAnswers);

    if (currentQuestion < skinTypeQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      // All questions answered, navigate to home
      navigation.navigate('Home');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[skinTypeQuestions[currentQuestion - 1].id] || null);
    }
  };

  const currentQuestionData = skinTypeQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / skinTypeQuestions.length) * 100;

  return (
    <SafeAreaView className="flex-1">
      <StatusBar style="light" />
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#000000']}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-12 pb-6">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-12 h-12 rounded-full items-center justify-center mb-6"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <Text className="text-3xl font-bold text-white mb-2">
              Skin Assessment
            </Text>
            <Text className="text-gray-300 text-lg">
              Help us understand your skin better
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="px-6 mb-8">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-300 text-sm">
                Question {currentQuestion + 1} of {skinTypeQuestions.length}
              </Text>
              <Text className="text-gray-300 text-sm">
                {Math.round(progress)}%
              </Text>
            </View>
            <View 
              className="h-3 rounded-full"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <LinearGradient
                colors={['#00f5ff', '#0080ff', '#8000ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="h-3 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </View>
          </View>

          {/* Question */}
          <View className="px-6 mb-8">
            <Text className="text-2xl font-semibold text-white leading-relaxed">
              {currentQuestionData.question}
            </Text>
          </View>

          {/* Options */}
          <View className="px-6 space-y-4">
            {currentQuestionData.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => handleOptionSelect(option.id)}
                className="p-4 rounded-2xl flex-row items-center"
                style={{
                  backgroundColor: selectedOption === option.id
                    ? 'rgba(0, 245, 255, 0.1)'
                    : 'rgba(255, 255, 255, 0.03)',
                  borderWidth: 1,
                  borderColor: selectedOption === option.id
                    ? 'rgba(0, 245, 255, 0.3)'
                    : 'rgba(255, 255, 255, 0.08)',
                }}
              >
                <View 
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{
                    backgroundColor: selectedOption === option.id
                      ? 'rgba(0, 245, 255, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                    borderWidth: 1,
                    borderColor: selectedOption === option.id
                      ? 'rgba(0, 245, 255, 0.4)'
                      : 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Ionicons
                    name={option.icon}
                    size={24}
                    color={selectedOption === option.id ? '#00f5ff' : 'white'}
                  />
                </View>
                <Text 
                  className={`text-lg font-medium flex-1 ${
                    selectedOption === option.id ? 'text-cyan-400' : 'text-white'
                  }`}
                >
                  {option.text}
                </Text>
                {selectedOption === option.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#00f5ff" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Navigation Buttons */}
          <View className="px-6 py-8 flex-row justify-between">
            <TouchableOpacity
              onPress={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-3 rounded-2xl"
              style={{
                backgroundColor: currentQuestion === 0
                  ? 'rgba(255, 255, 255, 0.03)'
                  : 'rgba(255, 255, 255, 0.05)',
                borderWidth: 1,
                borderColor: currentQuestion === 0
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <Text 
                className={`text-lg font-semibold ${
                  currentQuestion === 0 ? 'text-gray-600' : 'text-white'
                }`}
              >
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNext}
              className="rounded-2xl px-8 py-3 overflow-hidden"
            >
              <LinearGradient
                colors={['#00f5ff', '#0080ff', '#8000ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="px-8 py-3 rounded-2xl"
              >
                <Text className="text-black text-lg font-bold">
                  {currentQuestion === skinTypeQuestions.length - 1 ? 'Finish' : 'Next'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
