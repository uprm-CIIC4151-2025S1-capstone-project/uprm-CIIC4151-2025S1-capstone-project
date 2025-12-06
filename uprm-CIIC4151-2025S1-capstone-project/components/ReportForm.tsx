import { ReportFormData, ReportCategory } from "@/types/interfaces";
import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, Alert, Image, TouchableOpacity, FlatList } from "react-native";
import { Button, Chip, TextInput, Text } from "react-native-paper";
import { useAppColors } from "@/hooks/useAppColors";
import * as ImagePicker from "expo-image-picker";
import { getLocations } from "@/utils/api";

export interface ReportFormRef {
  clearForm: () => void;
}

interface ReportFormProps {
  onSubmit?: (data: ReportFormData) => void;
  onCancel?: () => void;
  onClear?: () => void;
  loading?: boolean;
}

interface Location {
  id: number;
  city: string;
}

export default function ReportForm({ onSubmit, onCancel, onClear, loading = false }: ReportFormProps) {
  const { colors } = useAppColors();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ReportCategory>(ReportCategory.OTHER);
  const [locationId, setLocationId] = useState<number | null>(null);
  const [city, setCity] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [occurredOn, setOccurredOn] = useState<Date>(new Date());

  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Load cities from API
  useEffect(() => {
    (async () => {
      try {
        const res = await getLocations(1, 200); // adjust limit as needed
        const locArray = Array.isArray(res) ? res : res?.locations || [];
        setLocations(locArray);
      } catch (err) {
        console.error("Failed to load locations:", err);
      }
    })();
  }, []);

  const categories = [
    { label: "Pothole", value: ReportCategory.POTHOLE },
    { label: "Street Light", value: ReportCategory.STREET_LIGHT },
    { label: "Traffic Signal", value: ReportCategory.TRAFFIC_SIGNAL },
    { label: "Road Damage", value: ReportCategory.ROAD_DAMAGE },
    { label: "Sanitation", value: ReportCategory.SANITATION },
    { label: "Flooding", value: ReportCategory.FLOODING },
    { label: "Water Outage", value: ReportCategory.WATER_OUTAGE },
    { label: "Wandering Waste", value: ReportCategory.WANDERING_WASTE },
    { label: "Electrical Hazard", value: ReportCategory.ELECTRICAL_HAZARD },
    { label: "Sinkhole", value: ReportCategory.SINKHOLE },
    { label: "Fallen Tree", value: ReportCategory.FALLEN_TREE },
    { label: "Pipe Leak", value: ReportCategory.PIPE_LEAK },
  ];

  const clearForm = () => {
    setTitle("");
    setDescription("");
    setCategory(ReportCategory.OTHER);
    setLocationId(null);
    setCity("");
    setImageUrl("");
    setOccurredOn(new Date());
    onClear?.();
  };

  const isFormValid = () => title.trim() !== "" && description.trim() !== "";

  const handleSubmit = () => {
    if (!isFormValid()) {
      Alert.alert("Validation Error", "Please fill in all required fields");
      return;
    }
    if (!onSubmit) return;

    const reportData: ReportFormData = {
      title: title.trim(),
      description: description.trim(),
      category,
      location_id: locationId || undefined,
      image_url: imageUrl.trim() || undefined,
      occurred_on: occurredOn.toISOString(),
    };

    onSubmit(reportData);
  };

  const handleClear = () => {
    Alert.alert("Clear Form", "Are you sure you want to clear all fields?", [
      { text: "Keep Editing", style: "cancel" },
      { text: "Clear All", style: "destructive", onPress: clearForm },
    ]);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "We need access to your photo library to attach an image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImageUrl(uri);
    }
  };

  const handleCityInput = (text: string) => {
    setCity(text);
    setShowDropdown(true);
    const filtered = Array.isArray(locations)
      ? locations.filter((loc) => loc.city.toLowerCase().includes(text.toLowerCase()))
      : [];
    setFilteredLocations(filtered);
    setLocationId(null);
  };

  const handleSelectCity = (loc: Location) => {
    setCity(loc.city);
    setLocationId(loc.id);
    setShowDropdown(false);
  };

  const styles = createStyles(colors);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <TextInput
          label="Title *"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          disabled={loading}
          style={styles.input}
          maxLength={100}
          placeholder="Brief description of the issue"
          textColor={colors.input.text}
          placeholderTextColor={colors.input.placeholder}
          outlineColor={colors.input.border}
          activeOutlineColor={colors.input.borderFocused}
        />

        <View style={styles.section}>
          <Text variant="bodyMedium" style={styles.sectionLabel}>Category *</Text>
          <View style={styles.chips}>
            {categories.map((cat) => (
              <Chip
                key={cat.value}
                selected={category === cat.value}
                onPress={() => setCategory(cat.value)}
                mode="outlined"
                style={[styles.chip, category === cat.value && { backgroundColor: colors.chip.selectedBackground }]}
                showSelectedCheck
                disabled={loading}
                selectedColor={category === cat.value ? colors.chip.selectedText : colors.chip.text}
              >
                {cat.label}
              </Chip>
            ))}
          </View>
        </View>

        <TextInput
          label="Description *"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={4}
          disabled={loading}
          style={styles.input}
          maxLength={500}
          placeholder="Detailed description of what happened..."
          textColor={colors.input.text}
          placeholderTextColor={colors.input.placeholder}
          outlineColor={colors.input.border}
          activeOutlineColor={colors.input.borderFocused}
        />

        <View style={styles.section}>
          <TextInput
            label="City (Optional)"
            value={city}
            onChangeText={handleCityInput}
            mode="outlined"
            disabled={loading}
            style={styles.input}
            placeholder="Type to search..."
            textColor={colors.input.text}
            placeholderTextColor={colors.input.placeholder}
            outlineColor={colors.input.border}
            activeOutlineColor={colors.input.borderFocused}
          />
          {showDropdown && filteredLocations.length > 0 && (
            <FlatList
              data={filteredLocations}
              keyExtractor={(item) => item.id.toString()}
              style={styles.dropdown}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.dropdownItem} onPress={() => handleSelectCity(item)}>
                  <Text>{item.city}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text variant="bodyMedium" style={styles.sectionLabel}>Image (Optional)</Text>
          <Button mode="outlined" onPress={handlePickImage} disabled={loading} icon="image" style={styles.button}>
            Select Image from Gallery
          </Button>
          {imageUrl ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
            </View>
          ) : (
            <Text variant="bodySmall" style={styles.helperTextContent}>No image selected.</Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {onCancel && (
            <Button mode="outlined" onPress={onCancel} disabled={loading} style={styles.button} icon="close" textColor={colors.text}>
              Cancel
            </Button>
          )}
          <Button mode="outlined" onPress={handleClear} disabled={loading} style={styles.button} icon="eraser" textColor={colors.text}>
            Clear
          </Button>
          <Button mode="contained" onPress={handleSubmit} disabled={!isFormValid() || loading} loading={loading} style={[styles.button, styles.submitButton]} icon="send" textColor={colors.button.text}>
            Submit
          </Button>
        </View>

        <View style={styles.helperText}>
          <Text variant="bodySmall" style={styles.helperTextContent}>* Required fields</Text>
          <Text variant="bodySmall" style={styles.helperTextContent}>Character limits: Title (100), Description (500)</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    scrollContent: { flexGrow: 1 },
    container: { gap: 20, padding: 16 },
    input: { backgroundColor: colors.input.background },
    section: { gap: 8 },
    sectionLabel: { fontWeight: "500", color: colors.textSecondary },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: { margin: 2 },
    buttonContainer: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginTop: 8 },
    button: { flex: 1 },
    submitButton: { flex: 2, backgroundColor: colors.button.primary },
    helperText: { marginTop: 16, padding: 12, backgroundColor: colors.backgroundMuted, borderRadius: 8, gap: 4 },
    helperTextContent: { color: colors.textMuted, textAlign: "center" },
    imagePreviewContainer: { marginTop: 8, alignItems: "center", gap: 4 },
    imagePreview: { width: 160, height: 160, borderRadius: 8 },
    dropdown: {
      maxHeight: 200,
      backgroundColor: colors.input.background,
      borderWidth: 1,
      borderColor: colors.input.border,
      borderRadius: 6,
      marginTop: 4,
    },
    dropdownItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.input.border,
    },
  });
