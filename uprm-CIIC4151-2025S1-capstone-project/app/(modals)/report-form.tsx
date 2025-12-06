import ReportForm, { ReportFormRef } from "@/components/ReportForm";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppColors } from "@/hooks/useAppColors";
import type { ReportCategory, ReportFormData } from "@/types/interfaces";
import {
  createReport,
  getReport,
  updateReport,
  uploadImageFromUri,
} from "@/utils/api";
import { getStoredCredentials } from "@/utils/auth";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet } from "react-native";

export default function ReportFormModal() {
  const router = useRouter();
  const { colors } = useAppColors();
  const emptyForm: ReportFormData = {
    title: "",
    description: "",
    category: "" as ReportCategory,
    location_id: undefined,
    image_url: "",
    occurred_on: "",
    latitude: undefined,
    longitude: undefined,
  };
  const [loading, setLoading] = useState(false);
  const formRef = useRef<ReportFormRef>(null);
  const { id, mode } = useLocalSearchParams<{
    id?: string;
    mode?: string;
  }>();
  const isEdit = mode === "edit" && !!id;
  const [initialData, setInitialData] = useState<ReportFormData | null>(null);

  // 🔹 Load data ONLY for edit mode
  useEffect(() => {
    const loadForEdit = async () => {
      if (!isEdit || !id) {
        setInitialData(null); // create mode
        return;
      }
      try {
        setLoading(true);
        const data = await getReport(Number(id));
        const mapped: ReportFormData = {
          title: data.title,
          description: data.description,
          category: data.category as ReportCategory,
          location_id: data.location_id ?? data.location, // adjust to your API
          image_url: data.image_url || "",
          occurred_on: data.occurred_on || "",
          latitude: data.latitude ?? undefined,
          longitude: data.longitude ?? undefined,
        };

        setInitialData(mapped);
      } catch (err) {
        console.error("Error loading report for edit:", err);
        Alert.alert("Error", "Could not load report for editing.");
        setInitialData(emptyForm);
      } finally {
        setLoading(false);
      }
    };
    loadForEdit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id]);

  const handleSubmit = async (data: ReportFormData) => {
    try {
      setLoading(true);

      const credentials = await getStoredCredentials();
      if (!credentials) {
        Alert.alert("Error", "Please log in to submit a report");
        router.replace("/");
        return;
      }

      if (!data.title || !data.description) {
        Alert.alert("Error", "Please fill in all required fields");
        return;
      }

      let finalImageUrl = data.image_url;

      if (finalImageUrl && finalImageUrl.startsWith("file://")) {
        try {
          finalImageUrl = await uploadImageFromUri(finalImageUrl);
        } catch (err) {
          console.error("Image upload failed:", err);
          Alert.alert(
            "Image Upload Error",
            "Could not upload the image. You can try again or submit without an image."
          );
          finalImageUrl = undefined;
        }
      }

      const submissionData: ReportFormData = {
        ...data,
        occurred_on: data.occurred_on || new Date().toISOString(),
        image_url: finalImageUrl || undefined,
      };

      if (isEdit) {
        await updateReport(Number(id), submissionData);
      } else {
        await createReport(submissionData);
      }
      formRef.current?.clearForm?.();
      if (isEdit) {
        // After editing → Profile tab
        console.log("Edit successful, navigating to /profile");
        router.navigate("/profile");
      } else {
        // After creating → Explore tab
        console.log("Create successful, navigating to /explore");
        router.navigate("/explore");
      }
      Alert.alert(
        "Success",
        isEdit ? "Report updated successfully!" : "Report submitted successfully!"
      );
    } catch (error: any) {
      console.error("Report submission error:", error);

      let errorMessage = "Failed to submit report. Please try again.";

      if (error?.response) {
        errorMessage =
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
      } else if (error?.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading) {
      router.back();
    }
  };

  const handleClear = () => {
    formRef.current?.clearForm?.();
  };

  const styles = createStyles(colors);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        {isEdit ? "Edit Report" : "Submit New Report"}
      </ThemedText>
      <ReportForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onClear={handleClear}
        loading={loading}
        initialData={initialData ?? undefined}
      />
    </ThemedView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.background,
    },
    title: {
      marginBottom: 16,
      textAlign: "center",
      color: colors.text,
    },
  });
