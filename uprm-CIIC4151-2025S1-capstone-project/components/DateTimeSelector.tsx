import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Menu, Button } from "react-native-paper";
import { useAppColors } from "@/hooks/useAppColors";

export interface DateTimeSelectorProps {
  value: Date;
  onChange: (date: Date) => void;
  disabled?: boolean;
}

/**
 * A React component that displays a date and time picker with the following options:
 *   1. Month (all 12 months)
 *   2. Day (all 31 days)
 *   3. Year (current year and 5 years before and after)
 *   4. Hour (12-hour format with AM/PM)
 *   5. Minute (all 60 minutes)
 * When the user clicks the "Apply" button, it calls the onApply function with the selected filter options.
 * If the user clicks the "Clear" button, it resets all filter options to their default values.
 * If the user clicks the "Close" button, it calls the onDismiss function.
 */
export default function DateTimeSelector({
  value,
  onChange,
  disabled = false
}: DateTimeSelectorProps) {
  const { colors } = useAppColors();

  // Initialize state with the provided date or current date
  const [day, setDay] = useState<string>(value.getDate().toString());
  const [month, setMonth] = useState<string>((value.getMonth() + 1).toString());
  const [year, setYear] = useState<string>(value.getFullYear().toString());
  const [hour, setHour] = useState<string>((value.getHours() % 12 || 12).toString());
  const [minute, setMinute] = useState<string>(value.getMinutes().toString().padStart(2, '0'));
  const [ampm, setAmpm] = useState<string>(value.getHours() >= 12 ? "PM" : "AM");

  // Menu visibility states
  const [visibleMenu, setVisibleMenu] = useState<string | null>(null);

  // Generate date and time options
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => (currentYear - 2 + i).toString());
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const ampmOptions = ["AM", "PM"];

  // Get display labels
  const getMonthLabel = (monthValue: string) => {
    const monthObj = months.find(m => m.value === monthValue);
    return monthObj ? monthObj.label : "Select Month";
  };

  const getDisplayValue = (value: string, options: {value: string, label: string}[] | string[]) => {
    if (Array.isArray(options) && options.length > 0 && typeof options[0] === 'object') {
      const option = (options as {value: string, label: string}[]).find(opt => opt.value === value);
      return option ? option.label : `Select`;
    }
    return value || `Select`;
  };

  // Handle date and time field changes
  const handleDateTimeChange = useCallback(() => {
    if (day && month && year && hour && minute && ampm) {
      // Convert 12-hour format to 24-hour format
      let hour24 = parseInt(hour);
      if (ampm === "PM" && hour24 !== 12) {
        hour24 += 12;
      } else if (ampm === "AM" && hour24 === 12) {
        hour24 = 0;
      }

      const newDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        hour24,
        parseInt(minute)
      );

      if (!isNaN(newDate.getTime())) {
        onChange(newDate);
      }
    }
  }, [day, month, year, hour, minute, ampm, onChange]);

  // Update internal state when external value changes
  useEffect(() => {
    setDay(value.getDate().toString());
    setMonth((value.getMonth() + 1).toString());
    setYear(value.getFullYear().toString());

    const hours12 = value.getHours() % 12 || 12;
    setHour(hours12.toString());
    setMinute(value.getMinutes().toString().padStart(2, '0'));
    setAmpm(value.getHours() >= 12 ? "PM" : "AM");
  }, [value]);

  // Auto-update date when fields change
  useEffect(() => {
    if (day && month && year && hour && minute && ampm) {
      handleDateTimeChange();
    }
  }, [day, month, year, hour, minute, ampm, handleDateTimeChange]);

  const formatDate = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const showMenu = (menuName: string) => setVisibleMenu(menuName);
  const hideMenu = () => setVisibleMenu(null);

  const handleSelect = (setter: (value: string) => void, value: string) => {
    setter(value);
    hideMenu();
  };

  const styles = createStyles(colors);

  // Individual dropdown components with proper anchor
  const DropdownWithMenu = ({
    label,
    value,
    options,
    onSelect,
    menuName,
    getDisplayText
  }: {
    label: string;
    value: string;
    options: {value: string, label: string}[] | string[];
    onSelect: (value: string) => void;
    menuName: string;
    getDisplayText?: (value: string) => string;
  }) => {
    const displayText = getDisplayText ? getDisplayText(value) : getDisplayValue(value, options);

    return (
      <View style={styles.dropdownField}>
        <Text variant="bodySmall" style={styles.dateFieldLabel}>
          {label}
        </Text>
        <Menu
          visible={visibleMenu === menuName}
          onDismiss={hideMenu}
          anchor={
            <Button
              mode="outlined"
              onPress={() => showMenu(menuName)}
              disabled={disabled}
              style={styles.dropdownButton}
              contentStyle={styles.dropdownButtonContent}
              textColor={colors.text}
            >
              {displayText}
            </Button>
          }
          style={styles.menu}
        >
          {options.map((option) => {
            const optionValue = typeof option === 'object' ? option.value : option;
            const optionLabel = typeof option === 'object' ? option.label : option;

            return (
              <Menu.Item
                key={optionValue}
                onPress={() => handleSelect(onSelect, optionValue)}
                title={optionLabel}
                style={styles.menuItem}
              />
            );
          })}
        </Menu>
      </View>
    );
  };

  return (
    <View style={styles.dateTimeContainer}>
      {/* Date Section */}
      <Text variant="bodyMedium" style={styles.sectionSubLabel}>
        Date
      </Text>
      <View style={styles.dateContainer}>
        <DropdownWithMenu
          label="Month *"
          value={month}
          options={months}
          onSelect={setMonth}
          menuName="month"
          getDisplayText={(val) => getMonthLabel(val)}
        />

        <DropdownWithMenu
          label="Day *"
          value={day}
          options={days.map(d => ({ value: d, label: d }))}
          onSelect={setDay}
          menuName="day"
        />

        <DropdownWithMenu
          label="Year *"
          value={year}
          options={years.map(y => ({ value: y, label: y }))}
          onSelect={setYear}
          menuName="year"
        />
      </View>

      {/* Time Section */}
      <Text variant="bodyMedium" style={styles.sectionSubLabel}>
        Time
      </Text>
      <View style={styles.timeContainer}>
        <DropdownWithMenu
          label="Hour *"
          value={hour}
          options={hours.map(h => ({ value: h, label: h }))}
          onSelect={setHour}
          menuName="hour"
        />

        <DropdownWithMenu
          label="Minute *"
          value={minute}
          options={minutes.map(m => ({ value: m, label: m }))}
          onSelect={setMinute}
          menuName="minute"
        />

        <DropdownWithMenu
          label="AM/PM *"
          value={ampm}
          options={ampmOptions}
          onSelect={setAmpm}
          menuName="ampm"
        />
      </View>

      <Text variant="bodySmall" style={styles.dateHelperText}>
        Selected: {formatDate(value)}
      </Text>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    dateTimeContainer: {
      gap: 16,
      marginTop: 8,
    },
    dateContainer: {
      flexDirection: "row",
      gap: 8,
    },
    timeContainer: {
      flexDirection: "row",
      gap: 8,
    },
    dropdownField: {
      flex: 1,
      gap: 4,
    },
    dateFieldLabel: {
      fontWeight: "500",
      color: colors.textSecondary,
      marginLeft: 4,
    },
    sectionSubLabel: {
      fontWeight: "500",
      color: colors.textSecondary,
      marginBottom: 8,
    },
    dateHelperText: {
      marginTop: 8,
      color: colors.textMuted,
      fontStyle: "italic",
      textAlign: "center",
    },
    dropdownButton: {
      backgroundColor: colors.input.background,
      borderColor: colors.input.border,
      borderRadius: 4,
      height: 44,
    },
    dropdownButtonContent: {
      height: 44,
    },
    menu: {
      marginTop: 4,
      borderRadius: 8,
    },
    menuItem: {
      paddingVertical: 8,
    },
  });
