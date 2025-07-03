import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import ApiService from '../services/api';

const skinTypeQuestions = [
  {
    id: 1,
    question: "How does your skin feel 2-3 hours after cleansing without applying any products?",
    category: "oiliness",
    options: [
      { 
        id: 'a', 
        text: 'Very tight, dry, and uncomfortable', 
        icon: 'contract-outline',
        scores: { dry: 3, sensitive: 1 }
      },
      { 
        id: 'b', 
        text: 'Slightly tight but comfortable', 
        icon: 'water-outline',
        scores: { dry: 2, normal: 1 }
      },
      { 
        id: 'c', 
        text: 'Comfortable and balanced', 
        icon: 'checkmark-circle-outline',
        scores: { normal: 3 }
      },
      { 
        id: 'd', 
        text: 'Slightly oily in T-zone only', 
        icon: 'ellipse-outline',
        scores: { combination: 3 }
      },
      { 
        id: 'e', 
        text: 'Oily all over', 
        icon: 'ellipse',
        scores: { oily: 3 }
      }
    ]
  },
  {
    id: 2,
    question: "How often do you experience breakouts and where?",
    category: "acne_tendency",
    options: [
      { 
        id: 'a', 
        text: 'Rarely or never', 
        icon: 'happy-outline',
        scores: { normal: 2, dry: 2 }
      },
      { 
        id: 'b', 
        text: 'Occasionally on T-zone (forehead, nose, chin)', 
        icon: 'alert-outline',
        scores: { combination: 3, normal: 1 }
      },
      { 
        id: 'c', 
        text: 'Frequently on T-zone and cheeks', 
        icon: 'warning-outline',
        scores: { oily: 2, combination: 1 }
      },
      { 
        id: 'd', 
        text: 'Almost constantly all over face', 
        icon: 'close-circle-outline',
        scores: { oily: 3 }
      },
      { 
        id: 'e', 
        text: 'Rarely, but when I do they are painful and inflamed', 
        icon: 'flame-outline',
        scores: { sensitive: 3 }
      }
    ]
  },
  {
    id: 3,
    question: "How does your skin typically react to new skincare products?",
    category: "sensitivity",
    options: [
      { 
        id: 'a', 
        text: 'Almost always breaks out or gets irritated', 
        icon: 'alert-circle-outline',
        scores: { sensitive: 3 }
      },
      { 
        id: 'b', 
        text: 'Sometimes gets red or stings', 
        icon: 'warning-outline',
        scores: { sensitive: 2, dry: 1 }
      },
      { 
        id: 'c', 
        text: 'Generally tolerates most products well', 
        icon: 'shield-outline',
        scores: { normal: 2, combination: 1 }
      },
      { 
        id: 'd', 
        text: 'Very tolerant, rarely has reactions', 
        icon: 'shield-checkmark-outline',
        scores: { oily: 2, normal: 1 }
      }
    ]
  },
  {
    id: 4,
    question: "How does your skin look and feel by midday without touch-ups?",
    category: "oil_production",
    options: [
      { 
        id: 'a', 
        text: 'Still matte, might feel dry or tight', 
        icon: 'contract-outline',
        scores: { dry: 3 }
      },
      { 
        id: 'b', 
        text: 'Fresh and comfortable', 
        icon: 'sparkles-outline',
        scores: { normal: 3 }
      },
      { 
        id: 'c', 
        text: 'Slightly shiny only in T-zone', 
        icon: 'partly-sunny-outline',
        scores: { combination: 3 }
      },
      { 
        id: 'd', 
        text: 'Noticeably oily and shiny', 
        icon: 'sunny-outline',
        scores: { oily: 2 }
      },
      { 
        id: 'e', 
        text: 'Very greasy and needs blotting', 
        icon: 'flashlight-outline',
        scores: { oily: 3 }
      }
    ]
  },
  {
    id: 5,
    question: "How visible are your pores?",
    category: "pore_size",
    options: [
      { 
        id: 'a', 
        text: 'Barely visible or very small all over', 
        icon: 'ellipse-outline',
        scores: { dry: 2, normal: 1 }
      },
      { 
        id: 'b', 
        text: 'Small to medium, more visible in T-zone', 
        icon: 'radio-button-off-outline',
        scores: { combination: 3, normal: 1 }
      },
      { 
        id: 'c', 
        text: 'Large and visible, especially on nose and cheeks', 
        icon: 'radio-button-on-outline',
        scores: { oily: 3 }
      }
    ]
  },
  {
    id: 6,
    question: "How does your skin respond to environmental factors (weather, AC, heating)?",
    category: "environmental_sensitivity",
    options: [
      { 
        id: 'a', 
        text: 'Gets very dry and flaky in cold/dry weather', 
        icon: 'snow-outline',
        scores: { dry: 3, sensitive: 1 }
      },
      { 
        id: 'b', 
        text: 'Becomes red or irritated easily with weather changes', 
        icon: 'thermometer-outline',
        scores: { sensitive: 3 }
      },
      { 
        id: 'c', 
        text: 'Generally stable, minor changes', 
        icon: 'leaf-outline',
        scores: { normal: 3 }
      },
      { 
        id: 'd', 
        text: 'T-zone gets oilier in humidity, cheeks stay normal', 
        icon: 'cloudy-outline',
        scores: { combination: 3 }
      },
      { 
        id: 'e', 
        text: 'Gets significantly oilier in heat/humidity', 
        icon: 'sunny-outline',
        scores: { oily: 2 }
      }
    ]
  },
  {
    id: 7,
    question: "How often do you need to wash your hair due to oiliness?",
    category: "oil_production_indicator",
    options: [
      { 
        id: 'a', 
        text: 'Every 3-4 days or less frequently', 
        icon: 'calendar-outline',
        scores: { dry: 2, normal: 1 }
      },
      { 
        id: 'b', 
        text: 'Every 2-3 days', 
        icon: 'time-outline',
        scores: { normal: 2, combination: 1 }
      },
      { 
        id: 'c', 
        text: 'Daily', 
        icon: 'refresh-outline',
        scores: { oily: 2, combination: 1 }
      },
      { 
        id: 'd', 
        text: 'More than once daily', 
        icon: 'repeat-outline',
        scores: { oily: 3 }
      }
    ]
  },
  {
    id: 8,
    question: "When you pinch your cheek, how quickly does the skin bounce back?",
    category: "elasticity_hydration",
    options: [
      { 
        id: 'a', 
        text: 'Immediately snaps back', 
        icon: 'flash-outline',
        scores: { normal: 2, oily: 1 }
      },
      { 
        id: 'b', 
        text: 'Takes a moment to return', 
        icon: 'hourglass-outline',
        scores: { combination: 1, dry: 1 }
      },
      { 
        id: 'c', 
        text: 'Slowly returns to normal', 
        icon: 'timer-outline',
        scores: { dry: 3 }
      },
      { 
        id: 'd', 
        text: 'Becomes red or irritated from pinching', 
        icon: 'alert-circle-outline',
        scores: { sensitive: 3 }
      }
    ]
  }
];

export default function SkinTypeQuestionsScreen({ navigation }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setSelectedOption(answers[skinTypeQuestions[currentQuestion + 1].id] || null);
    } else {
      // All questions answered, submit assessment
      submitAssessment(newAnswers);
    }
  };

  const submitAssessment = async (finalAnswers) => {
    setIsSubmitting(true);
    
    try {
      // Convert answers object to detailed assessment data
      const answersArray = skinTypeQuestions.map(question => {
        const selectedOptionId = finalAnswers[question.id];
        if (selectedOptionId) {
          const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
          return {
            question: question.question,
            answer: selectedOption ? selectedOption.text : '',
            category: question.category,
            scores: selectedOption ? selectedOption.scores : {}
          };
        }
        return {
          question: question.question,
          answer: '',
          category: question.category,
          scores: {}
        };
      });

      const assessmentData = {
        answers: answersArray,
        additional_concerns: ""
      };

      console.log('Submitting assessment data:', assessmentData);
      
      const response = await ApiService.submitSkinAssessment(assessmentData);
      
      Alert.alert(
        'Assessment Complete! 🎉',
        `Your skin type has been identified as: ${response.skin_type.toUpperCase()}\n\nConfidence: ${response.confidence}%\n\nYou can now start analyzing products for your skin!`,
        [
          {
            text: 'View Results',
            onPress: () => navigation.navigate('SkinProfile', { skinData: response })
          },
          {
            text: 'Go to Home',
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            }),
            style: 'default'
          }
        ]
      );
    } catch (error) {
      console.error('Assessment submission error:', error);
      Alert.alert(
        'Assessment Failed',
        error.message || 'Failed to submit assessment. Please try again.',
        [
          {
            text: 'Retry',
            onPress: () => submitAssessment(finalAnswers)
          },
          {
            text: 'Skip for Now',
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            }),
            style: 'cancel'
          }
        ]
      );
    } finally {
      setIsSubmitting(false);
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
          <View className="px-6 pt-1 pb-6">
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
              Advanced Skin Assessment
            </Text>
            <Text className="text-gray-300 text-lg">
              Comprehensive analysis for accurate skin type detection
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="px-6 mb-8">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-300 text-sm">
                Question {currentQuestion + 1} of {skinTypeQuestions.length}
              </Text>
              <Text className="text-gray-300 text-sm">
                {Math.round(progress)}% Complete
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

          {/* Question Category Badge */}
          <View className="px-6 mb-4">
            <View className="bg-cyan-400/10 border border-cyan-400/20 rounded-full px-4 py-2 self-start">
              <Text className="text-cyan-400 text-sm font-medium capitalize">
                {currentQuestionData.category.replace('_', ' ')}
              </Text>
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
            {currentQuestionData.options.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => handleOptionSelect(option.id)}
                disabled={isSubmitting}
                className="p-4 rounded-2xl flex-row items-center"
                style={{
                  backgroundColor: selectedOption === option.id
                    ? 'rgba(0, 245, 255, 0.1)'
                    : 'rgba(255, 255, 255, 0.03)',
                  borderWidth: 1,
                  borderColor: selectedOption === option.id
                    ? 'rgba(0, 245, 255, 0.3)'
                    : 'rgba(255, 255, 255, 0.08)',
                  opacity: isSubmitting ? 0.6 : 1,
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
                
                <View className="flex-1">
                  <Text 
                    className={`text-lg font-medium ${
                      selectedOption === option.id ? 'text-cyan-400' : 'text-white'
                    }`}
                  >
                    {option.text}
                  </Text>
                </View>
                
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
              disabled={currentQuestion === 0 || isSubmitting}
              className="px-6 py-3 rounded-2xl"
              style={{
                backgroundColor: (currentQuestion === 0 || isSubmitting)
                  ? 'rgba(255, 255, 255, 0.03)'
                  : 'rgba(255, 255, 255, 0.05)',
                borderWidth: 1,
                borderColor: (currentQuestion === 0 || isSubmitting)
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <Text 
                className={`text-lg font-semibold ${
                  (currentQuestion === 0 || isSubmitting) ? 'text-gray-600' : 'text-white'
                }`}
              >
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNext}
              disabled={isSubmitting}
              className="rounded-2xl px-8 py-3 overflow-hidden"
              style={{ opacity: isSubmitting ? 0.6 : 1 }}
            >
              <LinearGradient
                colors={['#00f5ff', '#0080ff', '#8000ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="px-8 py-3 rounded-2xl"
              >
                <Text className="text-black text-lg font-bold">
                  {isSubmitting 
                    ? 'Analyzing...' 
                    : currentQuestion === skinTypeQuestions.length - 1 
                      ? 'Complete Assessment' 
                      : 'Next'
                  }
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
