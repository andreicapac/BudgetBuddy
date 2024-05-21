import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRealm, useQuery } from '@realm/react';
import { AuthContext } from './AuthContext'; // Assuming AuthContext is set up correctly
import { User } from './UserSchema';
import { useIsFocused } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
//import SegmentedControl from 'rn-segmented-control';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import { SafeAreaView } from 'react-native-safe-area-context';


type CategoryType = {
  name: string;
  isSelected: boolean;
};

const stylesSegment = StyleSheet.create({
  segmentedControlContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#465881', // Dark blue color
    top: 20,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderColor: 'transparent', // Border color should be transparent initially
  },
  selectedSegment: {
    borderBottomWidth: 4,
    borderColor: '#FFFFFF', // White color to highlight selected segment
  },
  segmentLabel: {
    color: '#D3D3D3', // Light grey color for label
    fontSize: 16,
  },
  selectedLabel: {
    color: '#FFFFFF', // White color for selected label
  },
});

const UpdateCategoriesScreen = ({navigation}) => {
  const initialState: CategoryType[] = [
    {

      name: 'Health',

      isSelected: false,
    },
    { 

      name: 'Personal Care',

      isSelected: false,
    },
    { 

      name: 'Education',

      isSelected: false,
    },
    {

      name: 'Bills',

      isSelected: false,
    },
    {

      name: 'House',

      isSelected: false,
    },
    {

      name: 'Utilities',

      isSelected: false,
    },
    {

      name: 'Clothes',

      isSelected: false,
    },
    {

      name: 'Transport',

      isSelected: false,
    },
    {

      name: 'Groceries',

      isSelected: false,
    },
    {
      name: 'Rent',

      isSelected: false,
    },
    {

      name: 'Travel',

      isSelected: false,
    },
    {

      name: 'Electronics',

      isSelected: false,
    },
    {

      name: 'Sports',

      isSelected: false,
    },
    {

      name: 'Gifts',

      isSelected: false,
    },
    {

      name: 'Car',

      isSelected: false,
    },
    {

      name: 'Shopping',

      isSelected: false,
    },
    {

      name: 'Eating Out',

      isSelected: false,
    },
    {

      name: 'Entertainment',

      isSelected: false,
    },
    {

      name: 'Pets',

      isSelected: false,
    },
    {

      name: 'Beauty',

      isSelected: false,
    },
    // ... other categories
  ];

  const categoryIcons = {
    'Health': 'hospital-box-outline',
    'Personal Care': 'toothbrush-paste',
    'Education': 'book-open-page-variant',
    'Bills': 'checkbook',
    'House': 'home-heart',
    'Utilities': 'water',
    'Clothes': 'tshirt-crew',
    'Transport': 'train',
    'Groceries': 'cart-variant',
    'Rent': 'home-city-outline',
    'Travel': 'airplane-takeoff',
    'Electronics': 'monitor-cellphone',
    'Sports': 'basketball',
    'Gifts': 'gift-outline',
    'Car': 'car',
    'Shopping': 'shopping-outline',
    'Eating Out': 'food',
    'Entertainment': 'gamepad-variant-outline',
    'Pets': 'paw',
    'Beauty': 'content-cut',
    // Add more categories and their corresponding icons here
  };
  const categoryDescription = {
    'Health': 'Medical expenses and wellness.',
    'Personal Care': 'Hygiene and personal items.',
    'Education': 'School expenses and books.',
    'Bills': 'Monthly utility and service bills.',
    'House': 'Home maintenance and supplies.',
    'Utilities': 'Electricity, water, gas, etc.',
    'Clothes': 'Apparel and accessories.',
    'Transport': 'Public and private transit costs.',
    'Groceries': 'Food and household necessities.',
    'Rent': 'Monthly rent or mortgage.',
    'Travel': 'Vacation and trip expenses.',
    'Electronics': 'Gadgets and tech purchases.',
    'Sports': 'Fitness and sporting activities.',
    'Gifts': 'Presents and donations.',
    'Car': 'Vehicle maintenance and fuel.',
    'Shopping': 'General shopping expenses.',
    'Eating Out': 'Dining and fast food.',
    'Entertainment': 'Movies, games, events, etc.',
    'Pets': 'Pet care and supplies',
    'Beauty': 'Cosmetics and beauty services.',
  };

  const categoryIncomeDescription = {
    'Deposits': 'Income from investments and returns',
    'Salary': 'Earnings from your job or business.',
    'Savings': 'Money set aside for future use.',
  };

  const categoryColors = {
    'Health': 'red',
    'Personal Care': '#22AA96',
    'Education': '#36453B',
    'Bills': '#BA2B05',
    'House': '#313B3B',
    'Utilities': '#00008B',
    'Clothes': '#6622CC',
    'Transport': '#be2596',
    'Groceries': '#7BA428',
    'Rent': '#847979',
    'Travel': '#657704',
    'Electronics': 'black',
    'Sports': '#FF8811',
    'Gifts': '#16AA0E',
    'Car': '#1DAFA1',
    'Shopping': '#9191E9',
    'Eating Out': '#B49A67',
    'Entertainment': '#301014',
    'Pets': '#008B8B',
    'Beauty': '#B8860B',
    // Add more categories and their corresponding colors here
  };

  const categoryIconsIncome = {
    'Deposits': 'bank-transfer',
    'Salary': 'cash-multiple',
    'Savings': 'piggy-bank-outline',
  }

  const categoryColorsIncome = {
    'Deposits': '#18A999',
    'Salary': '#49be25',
    'Savings': '#BA2B05',
  }


  const realm = useRealm();
  const { userToken } = useContext(AuthContext); // Assuming AuthContext provides userToken
  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>(initialState);
  const [selectedIncomeCategories, setSelectedIncomeCategories] = useState<CategoryType[]>(initialState);
  const isFocused = useIsFocused();
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState(0);
  const [tabIndex, setTabIndex] = React.useState(0);

  const showExpenses = () => {
    setSelectedSegmentIndex(0);
    // Logic to display expenses categories
  };

  const showIncome = () => {
    setSelectedSegmentIndex(1);
    // Logic to display income categories
  };

// Function to get the icon for a category
const getIconForCategory = (categoryName) => {
  return categoryIcons[categoryName] || require('../assets/icon-react-native.png'); // Fallback to a default icon
};

// Function to get the color for a category
const getColorForCategory = (categoryName) => {
  return categoryColors[categoryName] || '#D3D3D3'; // Fallback to a default color (LightGray)
};

// Function to get the icon for a category
const getIconForCategoryIncome = (categoryName) => {
  return categoryIconsIncome[categoryName] || require('../assets/icon-react-native.png'); // Fallback to a default icon
};

// Function to get the color for a category
const getColorForCategoryIncome = (categoryName) => {
  return categoryColorsIncome[categoryName] || '#D3D3D3'; // Fallback to a default color (LightGray)
};

/*
  useEffect(() => {
    const fetchUserAndCategories = async () => {
        const token = await AsyncStorage.getItem('userToken'); // Assume token is stored correctly
        const users = realm.objects<User>('User').filtered(`token == "${token}"`);
        const user = users.length > 0 ? users[0] : null;
      
        if (user) {
          // Convert Realm.List to an array to use the map function
          const categories = Array.from(user.expensesCategories).map(cat => ({
            name: cat.name,
            expenses: cat.expenses,
            isSelected: cat.isSelected,
          }));
          setSelectedCategories(categories);
        }
      };
    if (isFocused)
    {
      fetchUserAndCategories();
    }
  }, [isFocused,realm, userToken]);

*/

useEffect(() => {
  const fetchUserAndCategories = async () => {
    const token = await AsyncStorage.getItem('userToken'); // Assume token is stored correctly
    const users = realm.objects<User>('User').filtered(`token == "${token}"`);
    const user = users.length > 0 ? users[0] : null;
  
    if (user) {
      // Map over the user's expense categories to create CategoryType objects
      const categoriesFromRealm: CategoryType[] = Array.from(user.expensesCategories).map(cat => ({
        name: cat.name,
        isSelected: cat.isSelected,
      }));
      // If you need to associate icons and colors, do it here before setting state
      const categoriesWithIconsAndColors = categoriesFromRealm.map(cat => {
        // Here you would look up the icon and color based on the category name or another attribute
        // This is a placeholder for the logic you would use to assign icons and colors
        const icon = getIconForCategory(cat.name); // Implement this function based on your requirements
        const color = getColorForCategory(cat.name); // Implement this function based on your requirements
        
        return {
          ...cat,
          icon: icon, // Add the icon information here
          color: color, // Add the color information here
        };
      });
      setSelectedCategories(categoriesWithIconsAndColors);


      const categoriesIncomeFromRealm: CategoryType[] = Array.from(user.incomeCategories).map(cat => ({
        name: cat.name,
        isSelected: cat.isSelected,
      }));
      // If you need to associate icons and colors, do it here before setting state
      const categoriesIconsWithIconsAndColors = categoriesIncomeFromRealm.map(cat => {
        // Here you would look up the icon and color based on the category name or another attribute
        // This is a placeholder for the logic you would use to assign icons and colors
        const icon = getIconForCategoryIncome(cat.name); // Implement this function based on your requirements
        const color = getColorForCategoryIncome(cat.name); // Implement this function based on your requirements
        
        return {
          ...cat,
          icon: icon, // Add the icon information here
          color: color, // Add the color information here
        };
      });
      setSelectedIncomeCategories(categoriesIconsWithIconsAndColors);
    }
  };

  if (isFocused && realm && userToken) {
    fetchUserAndCategories();
  }
}, [isFocused, realm, userToken]);

  const handleSelectCategory = async(name) => {
    const token = await AsyncStorage.getItem('userToken'); // Assume token is stored correctly
    const users = realm.objects<User>('User').filtered(`token == "${token}"`);
    const user = users.length > 0 ? users[0] : null;

    setSelectedCategories(current =>
      current.map(cat => {
        if (cat.name === name) {
          // Update the isSelected status in Realm
          realm.write(() => {
            const categoryToUpdate = user.expensesCategories.find(c => c.name === name);
            if (categoryToUpdate) {
              categoryToUpdate.isSelected = !categoryToUpdate.isSelected;
            }
          });
        }
        return {
          ...cat,
          isSelected: cat.name === name ? !cat.isSelected : cat.isSelected,
        };
      })
    );
  };
  
  const handleSelectIncomeCategory = async(name) => {
    const token = await AsyncStorage.getItem('userToken'); // Assume token is stored correctly
    const users = realm.objects<User>('User').filtered(`token == "${token}"`);
    const user = users.length > 0 ? users[0] : null;

    setSelectedIncomeCategories(current =>
      current.map(cat => {
        if (cat.name === name) {
          // Update the isSelected status in Realm
          realm.write(() => {
            const categoryToUpdate = user.incomeCategories.find(c => c.name === name);
            if (categoryToUpdate) {
              categoryToUpdate.isSelected = !categoryToUpdate.isSelected;
            }
          });
        }
        return {
          ...cat,
          isSelected: cat.name === name ? !cat.isSelected : cat.isSelected,
        };
      })
    );
  };


  const handleUpdateCategories = async () => {
    const token = await AsyncStorage.getItem('userToken'); // Retrieve the stored token
    const users = realm.objects<User>('User').filtered(`token == "${token}"`);
    const currentUser = users.length > 0 ? users[0] : null;
  
    if (currentUser) {
      realm.write(() => {
        // Iterate over the current user's categories
        currentUser.expensesCategories.forEach(cat => {
          // Find the category in selectedCategories by name
          const found = selectedCategories.find(c => c.name === cat.name);
          if (found) {
            // Update isSelected based on the selection in the UI
            cat.isSelected = found.isSelected;
          }
        });
        currentUser.incomeCategories.forEach(cat => {
          // Find the category in selectedCategories by name
          const found = selectedCategories.find(c => c.name === cat.name);
          if (found) {
            // Update isSelected based on the selection in the UI
            cat.isSelected = found.isSelected;
          }
        });
      });
      console.log('Categories updated successfully.');
      navigation.goBack(); // Navigate back to the previous screen
      
    } else {
      console.log('Current user not found.');
    }
  };
  

  // return (
  //   <View style={styles.container}>
  //     <FlatList
  //       data={selectedCategories}
  //       keyExtractor={item => item.name}
  //       renderItem={({ item }) => (
  //         <TouchableOpacity
  //           style={[styles.categoryItem, { backgroundColor: item.isSelected ? 'green' : 'red' }]}
  //           onPress={() => handleSelectCategory(item.name)}
  //         >
  //           <Text style={styles.categoryText}>{item.name}</Text>
  //         </TouchableOpacity>
  //       )}
  //     />
  //     <Button title="Done" onPress={handleUpdateCategories} />
  //   </View>
  // );


  const handleIndexChange = index => {
    setSelectedSegmentIndex(index);
  };


  const CategoryButton = ({ name, isSelected, onPress }: CategoryType & { onPress: () => void }) => (
    <TouchableOpacity style={[styles.item, { backgroundColor: isSelected ? '#A1CEB1' : 'transparent', borderWidth:2, borderColor: isSelected ? 'white' : '#7ac695', elevation: isSelected? 5:0 }]} onPress={onPress}>
      {/* <Image source={icon} style={styles.icon} /> */}
       <MaterialCommunityIcons name={categoryIcons[name]} size={30} left={3} style={styles.icon} color={categoryColors[name]} /> 
      <Text style={[styles.titleCategory, {color: categoryColors[name]}]}>{name}</Text>
      <Text style={{position: 'absolute', left: 50, top:25, fontFamily: 'Quicksand-Regular'}}>{categoryDescription[name]}</Text>
    </TouchableOpacity>
  );

  const CategoryButtonIncome = ({ name, isSelected, onPress }: CategoryType & { onPress: () => void }) => (
    <TouchableOpacity style={[styles.item, { backgroundColor: isSelected ? '#A1CEB1' : 'transparent', borderWidth:2, borderColor: isSelected ? 'white' : '#7ac695', elevation: isSelected? 5:0 }]} onPress={onPress}>
      {/* <Image source={icon} style={styles.icon} /> */}
       <MaterialCommunityIcons name={categoryIconsIncome[name]} size={30} left={3} style={styles.icon} color={categoryColorsIncome[name]} /> 
      <Text style={[styles.titleCategory, {color: categoryColorsIncome[name]}]}>{name}</Text>
      <Text style={{position: 'absolute', left: 50, top:25, fontFamily: 'Quicksand-Regular', fontSize: 13}}>{categoryIncomeDescription[name]}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      <View style={styles.topSection}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={{ color: 'white',  fontFamily:'Quicksand-Medium'}}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Update Categories</Text>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.toggleDrawer()}>
        <MaterialCommunityIcons name="menu" size={30} color={'white'} />
      </TouchableOpacity>
      </View>
      

      <SegmentedControlTab
        tabsContainerStyle={styles.tabsContainer}
        tabStyle={[styles.tab]}
        activeTabStyle={styles.activeTab}
        tabTextStyle={styles.tabText}
        activeTabTextStyle={styles.activeTabText}
        values={['Expenses', 'Income']}
        selectedIndex={selectedSegmentIndex}
        onTabPress={handleIndexChange}
      />
      {/*<SegmentedControl
        onLeftPress={showExpenses}
        onRightPress={showIncome}
        leftLabel="Expenses"
        rightLabel="Income"
        selectedIndex={selectedSegmentIndex}>
  </SegmentedControl>*/}

    { selectedSegmentIndex === 0 ? (
      <View style={styles.CategoriesList}>
        <FlatList
          data={selectedCategories}
          keyExtractor={item => item.name}
          renderItem={({ item }) => (
            <CategoryButton {...item} onPress={() => handleSelectCategory(item.name)} />
          )}
        />
      
      </View>
      ) : (
        <View style={styles.CategoriesList}>
        <FlatList
          data={selectedIncomeCategories}
          keyExtractor={item => item.name}
          renderItem={({ item }) => (
            <CategoryButtonIncome {...item} onPress={() => handleSelectIncomeCategory(item.name)} />
          )}
        />
      
      </View>
      )}

        <TouchableOpacity
            style={styles.buttonStyle}
            onPress={handleUpdateCategories}
          >
            <Text style={{fontSize: 20, color:'white', fontFamily:'Quicksand-Bold'}}>Done</Text>
          </TouchableOpacity>

    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start', // Changed to flex-start to avoid centering vertically
    alignItems: 'center',
    paddingTop: 20, // Add padding at the top for better spacing
    backgroundColor: '#f0f0f0', // A light background color for a refreshing look
  },
  menuButton: {
    position: 'absolute',
    alignSelf: 'flex-end',
    left: 375,
    top: 49,
    padding: 10,
    zIndex: 1,
  },
  box: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  tabsContainer: {
    backgroundColor: '#F5F9E9', // Background color of the segmented control
    borderRadius: 12,
    top: 87,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 4,
    paddingRight: 4,
    width: '90%', // Width of the segmented control
    height: 50, // Height of the segmented control
    shadowColor: '#7ac695', // Adding shadow for a subtle elevation effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10, // Elevation for Android
    borderColor: '#7ac695', // Border color for the segmented control
    borderWidth: 2,
  },
  activeTab: {
    backgroundColor: '#7ac695', //'#F5F9E9', // Background color of the active tab
    borderColor: '#7ac695', // Border color of the active tab
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: 'black', // Adding shadow for a subtle elevation effect
    shadowOffset: { width: 100, height: 50 },
    shadowOpacity: 1,
    shadowRadius: 100,
    elevation: 50, // Elevation for Android
  },
  tab: {
    borderColor: 'transparent', // Border color of inactive tabs
    backgroundColor: 'transparent', // Background color of inactive tabs
    //borderRadius: 10,
    //borderWidth: 2,
  },
  tabText: {
    color: '#7ac695', // Text color of inactive tabs
    fontSize: 16,
    //fontWeight: 'bold',
    fontFamily: 'Quicksand-Medium',
  },
  activeTabText: {
    color: 'white', // Text color of the active tab
    fontSize: 18,
  },
  item: {
    borderRadius: 10,
    width: 306,
    height: 56,
    margin: '1%',
    alignItems: 'center',
    justifyContent: 'center',
    //backgroundColor: 'transparent', // Adjust the background color as needed
    // Add shadow and other styles as needed
    borderColor: '#BFCBC2',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    shadowColor: '#000', // Adding shadow for a subtle elevation effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Elevation for Android
  },
    titleCategory: {
    //color: 'white',
    //fontWeight: 'bold',
    fontFamily: 'Quicksand-Bold', // Changed font to 'Quicksand-Bold
    textAlign: 'left',
    fontSize: 18,
    width: 150,
    bottom: 30,
    right: 25,
    // Add styles for the title text
  },
  CategoriesList: {
    top: 80,
    width: '100%',
    height: '79%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    // Add styles for the list container
  },
  categoryItem: {
    flexDirection: 'row', // Set direction of items to row
    alignItems: 'center', // Center items vertically
    padding: 10,
    height: 60,
    marginVertical: 8,
    borderRadius: 10,
    backgroundColor: '#fff', // Default background color set to white
    shadowColor: '#000', // Adding shadow for a subtle elevation effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Elevation for Android
    width: 300, // Set width to 90% of the container
  },
  categoryText: {
    color: '#333', // A darker color for text for better readability
    fontWeight: 'bold', // Making text bold
    flex: 1, // Text takes up the remaining space
  },
  categoryIcon: {
    width: 24,
    height: 24,
    marginRight: 10, // Space between icon and text
  },
  button: {
    position: 'absolute',
    bottom: 10,
    marginTop: 20, // Add some space above the button
    width: '90%', // Match the width with the category items
    borderRadius: 40,

  },
  buttonText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  topSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 38, // Padding inside the top bar
    zIndex: 2, // Ensure the top bar is above other elements
    backgroundColor: '#7ac695', // Example background color
    borderBottomWidth: 2, // Example border
    borderBottomColor: '#7ac695', // Example border color
  },
  cancelButton: {
    position: 'absolute',
    left: 15,
    top: 65,
    zIndex: 1,
    // Add styles for the cancel button
  },
  buttonStyle: {
    position: 'absolute',
    width: '92%', // Slightly less than 1/4th of the container width
    height: '7%',
    bottom: 10,
    margin: '1%', // Add a little space between the buttons
    justifyContent: 'center', // Center text vertically
    alignItems: 'center', // Center text horizontally
    backgroundColor: '#28A745', // Button background color
    borderRadius: 10, // Rounded corners for buttons
    borderColor: '#7ac695', // Border color for the buttons
    borderWidth: 1,
    // Add shadows as per your design
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  icon: {
    marginRight: 250, // Space between the icon and the text
    top: 10,
    // Other styles if needed, like padding...
  },
  title:{
    color: 'white',
    fontFamily: 'Quicksand-Bold',
    textAlign: 'center',
    fontSize: 14,
    top: 25,
    width: 170,
  },
});

export default UpdateCategoriesScreen;
