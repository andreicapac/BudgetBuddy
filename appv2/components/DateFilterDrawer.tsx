import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// Assuming you have a DateFilterContext for managing the date filter state
import { DateFilterContext } from '../DateFilterContext';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DateFilterDrawer = (props) => {
  // Use DateFilterContext to manage date filters
  const { dateFilter, updateDateFilter } = useContext(DateFilterContext);
  const navigation = useNavigation();

  const handleDateFilterChange = async (newFilter) => {
    await updateDateFilter(newFilter);
    navigation.reset({index: 0, routes: [{name: 'Home'}] as any[]})
    //navigation.goBack();
  };

  return (
    <View style={{flex: 1}}>
    <DrawerContentScrollView {...props} contentContainerStyle={{backgroundColor: '#57A773', paddingTop: 95}}>
    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 1, color: 'white', position: 'absolute', top: 65, left: 25, fontFamily: 'Quicksand-Bold' }}>Date Filters</Text>
    </DrawerContentScrollView>
      <View style={{ flex: 1, padding: 20, bottom: 350 }}>
      
      <TouchableOpacity
        onPress={() => { handleDateFilterChange('day'); }}
        style={dateFilter === 'day' ? styles.selectedFilterStyle : styles.defaultFilterStyle}
      >
      <Text style={dateFilter === 'day' ? styles.selectedTextStyle : styles.defaultTextStyle}>Day</Text>
    </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDateFilterChange('week')} 
          style={dateFilter === 'week' ? styles.selectedFilterStyle : styles.defaultFilterStyle}     
        >
          <Text style={dateFilter === 'week' ? styles.selectedTextStyle : styles.defaultTextStyle}>Week</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDateFilterChange('month')}
          style={dateFilter === 'month' ? styles.selectedFilterStyle : styles.defaultFilterStyle}
        >
          <Text style={dateFilter === 'month' ? styles.selectedTextStyle : styles.defaultTextStyle}>Month</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() =>
          handleDateFilterChange('year')}
          style={dateFilter === 'year' ? styles.selectedFilterStyle : styles.defaultFilterStyle}
        >
          <Text style={dateFilter === 'year' ? styles.selectedTextStyle : styles.defaultTextStyle}>Year</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() =>
          handleDateFilterChange('all')} 
          style={dateFilter === 'all' ? styles.selectedFilterStyle : styles.defaultFilterStyle}
        >
          <Text style={dateFilter === 'all' ? styles.selectedTextStyle : styles.defaultTextStyle}>All Time</Text>
        </TouchableOpacity>
        {/* Implement custom date range picker */}
      </View>
      </View>
  );
};
const styles = StyleSheet.create({
defaultFilterStyle : {
  marginBottom: 10,
  backgroundColor: '#FFFFFF', // White background for unselected
  borderRadius: 5,
  borderWidth: 1,
  borderColor: '#C5E1A5',
  padding: 10
},
selectedFilterStyle : {
  marginBottom: 10,
  backgroundColor: '#4CAF50', // Green background for selected
  borderRadius: 5,
  borderWidth: 1,
  borderColor: '#C5E1A5',
  padding: 10
},
 defaultTextStyle : {
  fontSize: 14,
  fontWeight: '500',
  color: '#314E52', // Dark color for unselected
  textAlign: 'center'
},
 selectedTextStyle : {
  fontSize: 14,
  fontWeight: '500',
  color: '#FFFFFF', // White color for selected
  textAlign: 'center'
},
});

export default DateFilterDrawer;
