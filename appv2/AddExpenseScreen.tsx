
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, StatusBar, Image, FlatList, Modal, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useRealm } from '@realm/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExpenseCategory, Transaction, User } from './UserSchema'; // Ensure UserSchema is imported correctly
import { Picker } from '@react-native-picker/picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FontAwesome5 } from '@expo/vector-icons';
import { evaluate } from 'mathjs';
//import 'react-modern-calendar-datepicker/lib/DatePicker.css';
import { DateTime } from 'luxon';
import DatePicker, {getFormatedDate} from 'react-native-modern-datepicker';
import { useFocusEffect } from '@react-navigation/native';
import { BSON } from 'realm';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toast, ALERT_TYPE, AlertNotificationRoot } from 'react-native-alert-notification';
import { useCurrency } from './CurrencyContext';

type Category = {
  name: string;
};

const AddExpenseScreen = ({ route, navigation }) => {
  const { currentPeriod } = route.params;
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const realm = useRealm();
  const [categories, setCategories] = useState([]);
  const [inputValue, setInputValue] = React.useState('0');
  const [notesValue, setNotesValue] = React.useState('');
  const [isKeypadVisible, setIsKeypadVisible] = useState(true);
  const [flashRed, setFlashRed] = useState(false);
  const [keyboardStatus, setKeyboardStatus] = useState(undefined);
  const [openCalendar, setOpenCalendar] = useState(false); //open and closes calendar
  const todayFormatted = DateTime.now().toFormat('cccc, dd LLLL yyyy')
  const [selectedDay, setSelectedDay] = useState(todayFormatted);
  const [datePickerSelectedDay, setDatePickerSelectedDay] = useState(currentPeriod);
  const [dateFilter, setDateFilter] = useState('');
  const { currency } = useCurrency();

  function createTransaction(data: Partial<Transaction>): Transaction {
    return data as Transaction;
}

  const handleOnPressCalendar = () => setOpenCalendar(!openCalendar);

  const handleChangeDate = (date) => {
    // Assuming date is in 'YYYY/LL/DD' format, adjust the format string as necessary
    const formatString = 'yyyy/LL/dd';
    
    // Parse the received date using the specific format
    const parsedDate = DateTime.fromFormat(date, formatString);
  
    if (parsedDate.isValid) {
      // Now format the parsed date into your desired format
      const newFormattedDate = parsedDate.toFormat('cccc, dd LLLL yyyy');
      setSelectedDay(newFormattedDate);
      
      // Update the internal DatePicker format state if necessary
      // For DatePicker, you might still need the date in 'YYYY-MM-DD' format
      const isoDate = parsedDate.toISODate();
      setDatePickerSelectedDay(isoDate);
    } else {
      console.error('Invalid DateTime', parsedDate.invalidExplanation);
    }
  };

  type CategoryItem = {
    id: string;
    title: string;
    icon: string; // Replace 'any' with the proper type for your icons
    color: string;
  };
  
  // Dummy data for the list items
  const DATA: CategoryItem[] = [
    {
      id: '1',
      title: 'Health',
      icon: 'hospital-box-outline',
      color: 'red',
    },
    {
      id: '2',
      title: 'Personal Care',
      icon: 'toothbrush-paste',
      color: '#27C5AD',
    },
    {
      id: '3',
      title: 'Education',
      icon: 'book-open-page-variant',
      color: '#36453B',
    },
    {
      id: '4',
      title: 'Bills',
      icon: 'checkbook',
      color: '#BA2B05',
    },
    {
      id: '5',
      title: 'House',
      icon: 'home-heart',
      color: '#313B3B',
    },
    {
      id: '6',
      title: 'Utilities',
      icon: 'water',
      color: '#00008B',
    },
    { 
      id: '7',
      title: 'Clothes',
      icon: 'tshirt-crew',
      color: '#6622CC',
    },
    {
      id:'8',
      title: 'Transport',
      icon: 'train',
      color: '#be2596',
    },
    {
      id: '9',
      title: 'Groceries',
      icon: 'cart-variant',
      color: '#9ACD32',
    },
    {
      id: '10',
      title: 'Rent',
      icon: 'home-city-outline',
      color: '#847979',
    },
    {
      id: '11',
      title: 'Travel',
      icon: 'airplane-takeoff',
      color: '#8EA604',
    },
    {
      id: '12',
      title: 'Electronics',
      icon: 'monitor-cellphone',
      color: 'black',
    },
    {
      id: '13',
      title: 'Sports',
      icon: 'basketball',
      color: '#FF8811',
    },
    {
      id: '14',
      title: 'Gifts',
      icon: 'gift-outline',
      color: '#1DE713',
    },
    { 
      id: '15',
      title: 'Car',
      icon: 'car',
      color: '#40E0D0',
    },
    { 
      id: '16',
      title: 'Shopping',
      icon: 'shopping-outline',
      color: '#9191E9',
    },
    {
      id: '17',
      title: 'Eating Out',
      icon: 'food',
      color: '#B49A67',
    },
    {
      id: '18',
      title: 'Entertainment',
      icon: 'gamepad-variant-outline',
      color: '#301014',
    },
    {
      id: '19',
      title: 'Pets',
      icon: 'paw',
      color: '#008B8B',
    },
    {
      id: '20',
      title: 'Beauty',
      icon: 'content-cut',
      color: '#B8860B',
    },


    // ... other categories
  ];

  const CategoryButton = ({ title, color, icon, onPress }: CategoryItem & { onPress: () => void }) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      {/* <Image source={icon} style={styles.icon} /> */}
      <MaterialCommunityIcons name={icon} size={30} left={3} color={color} />
      <Text style={[styles.titleCategory, {color: color}]}>{title}</Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardStatus('Keyboard Shown');
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardStatus('Keyboard Hidden');
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const bottomStyle = keyboardStatus === 'Keyboard Shown' ? { bottom: 390, height:'11%' } : { bottom: 390 };
  const topStyle = keyboardStatus === 'Keyboard Shown' ? { bottom: 20 } : { bottom: 20 };

  const fetchDateFilter = async () => {
    try {
      const filter = await AsyncStorage.getItem('dateFilter');
      setDateFilter(filter);
    } catch (error) {
      console.error('Failed to fetch the date filter: ', error);
    }
  };

useEffect(() => {
  fetchDateFilter();
  if (dateFilter == 'day') {
    const currentPeriodDate = DateTime.fromISO(currentPeriod);
    console.log("current period:  ", currentPeriodDate)
    setSelectedDay(currentPeriodDate.toFormat('cccc, dd LLLL yyyy'));
  }
  else
  {
    const newTodayFormatted = DateTime.now().toFormat('cccc, dd LLLL yyyy');
    setSelectedDay(newTodayFormatted);
  }
}, [currentPeriod]);

  useFocusEffect(
    React.useCallback(() => {
      setInputValue('');
      setNotesValue('');
      setIsKeypadVisible(true);
    }, [])
  );

  const handeCategoryPress = async (item) => {
    if (inputValue === '0' || inputValue === '') { 
      // Trigger visual feedback
      setFlashRed(true);

      // Set a timeout to remove the flash after a short duration
      setTimeout(() => {
        setFlashRed(false);
      }, 500); // 500ms for flash duration

      setIsKeypadVisible(!isKeypadVisible);
    }

    const token = await AsyncStorage.getItem('userToken');
    const currentUser = realm.objects<User>('User').filtered(`token == "${token}"`)[0];

    if (!currentUser) {
      console.log("User not found.");
      return;
    }

    //console.log(item.title);
    setSelectedCategoryName(item.title);
    
    const selectedCategory = currentUser.expensesCategories.filtered(`name == "${item.title}"`)[0];

    if (!selectedCategory) {
      console.log("Category not found.");
      return;
    }

    const expenseValue = parseFloat(inputValue);
    
    if (isNaN(expenseValue)) {
      console.log("Invalid expense value.");
      return;
    }
    console.log(expenseValue)
    console.log(selectedCategory)
    console.log(notesValue)

    const expenseDate = DateTime.fromFormat(selectedDay, 'cccc, dd LLLL yyyy').toISO();

    try {
      realm.write(() => {
        const bson = new BSON.ObjectId();
        (selectedCategory as any).expenses.push({
          id: bson,
          amount: expenseValue,
          date: expenseDate,
          description: notesValue,
          category: item.title,
        });
        // Then, set isSelected to true for this category
        selectedCategory.isSelected = true;

        // currentUser.transactions.push({
        //   amount: expenseValue,
        //   date: expenseDate,
        //   category: item.title,
        //   description: notesValue,
        //   type: 'expense',
        // });
        const newTransaction = createTransaction({
          id: bson,
          amount: expenseValue,
          date: expenseDate,
          category: item.title,
          description: notesValue,
          type: 'expense',  // Since this is an expense entry
        });
  
        currentUser.transactions.push(newTransaction);

      });


    } catch (err) {
      console.log(`REALM Error adding expense : ${err}`);
      return;
    }

    Toast.show({
      type: ALERT_TYPE.SUCCESS,
      title: `${item.title} Expense Added`,
      textBody: `${expenseValue} ${currency}`,
      
      //autoClose: 5000,
      // onPress: () => {
      //   console.log('Toast clicked');
      // },
    });

    console.log(`Expense added to ${item.title}: ${expenseValue} |Description: ${notesValue} Date: ${expenseDate}`);
    navigation.goBack();    
  };

  const handleAddExpense = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const currentUser = realm.objects<User>('User').filtered(`token == "${token}"`)[0];

    if (!currentUser) {
      console.log("User not found.");
      return;
    }

    const selectedCategory = currentUser.expensesCategories.filtered(`name == "${selectedCategoryName}"`)[0];

    if (!selectedCategory) {
      console.log("Category not found.");
      return;
    }

    const expenseValue = parseFloat(expenseAmount);
    if (isNaN(expenseValue)) {
      console.log("Invalid expense value.");
      return;
    }

    try {
      realm.write(() => {
        (selectedCategory as any).expenses.push({
          amount: expenseValue,
          date: new Date(),
          description: expenseDescription,
          category: selectedCategoryName,
        });
        // Then, set isSelected to true for this category
        selectedCategory.isSelected = true;
      });
    } catch (err) {
      console.log(`REALM Error adding expense : ${err}`);
      return;
    }

    //showNotification('Expense added successfully', `Expense added to ${selectedCategoryName} with value of ${expenseValue} EUR`)


    console.log(`Expense added to ${selectedCategoryName}: ${expenseValue} |Description: ${expenseDescription} Date: ${new Date()}`);
    navigation.goBack();
  };

  // Function to handle the clear action
  const clearLastDigit = () => {
    setInputValue(inputValue.slice(0, -1));
  };

// Function to handle category button press
const handleChooseCategory = () => {
  if (inputValue === '0' || inputValue === '') {
    // Trigger visual feedback
    setFlashRed(true);

    // Set a timeout to remove the flash after a short duration
    setTimeout(() => {
      setFlashRed(false);
    }, 500); // 500ms for flash duration

    return; // Prevent further action if value is '0'
  }
  // Continue with showing categories if inputValue is not '0'
  setIsKeypadVisible(!isKeypadVisible);
};

  const handleKeyPress = (key) => {
    setInputValue((prevInputValue) => {
      // If the key is a digit or a decimal point, append it
      if (key.match(/[0-9.]/)) {
        // Prevent multiple decimal points
        if (key === '.' && prevInputValue.includes('.')) {
          return prevInputValue;
        }
        // If the current value is zero and a digit is pressed, replace it, unless it's a decimal point
        if (prevInputValue === '0' && key !== '.') {
          return key;
        }
        // Append the digit or decimal point
        return prevInputValue + key;
      }

      // If the key is an operator, handle it accordingly
      if (key.match(/[+\-*/]/) && prevInputValue !== '') {
        // Your logic to handle operators goes here
        // For simplicity, let's say we just store the last operator
        return prevInputValue + key;
      }

      // If the key is '=', evaluate the expression
      if ((key === '=' && prevInputValue === '') || (key === '/' && prevInputValue === '')) {
        return prevInputValue;
      }
      else if (key === '=') {
        try {
          let result = evaluate(prevInputValue);
          result = parseFloat(result.toFixed(2)); // Round to 2 decimal places
          return result.toString(); // Convert the result back to a string for display
        } catch (e) {
          return "Error";
        }
      }


      // Implement clear or backspace if needed
      // ...

      return prevInputValue;
    });
  };
 
  return (
  <>
      <StatusBar  barStyle="dark-content" hidden={false} backgroundColor="#7ac695" />
    <KeyboardAvoidingView 
    style={styles.container}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.topSection}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={{ color: 'white', fontFamily: 'Quicksand-Medium', }}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New expense</Text>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.toggleDrawer()}>
        <MaterialCommunityIcons name="menu" size={35} color={'white'} />
      </TouchableOpacity>
      </View>

      <View style={styles.dateContainer}>
        <TouchableOpacity onPress={handleOnPressCalendar}>
        <MaterialCommunityIcons name="calendar-multiselect" size={25} left={1} top={22} color={'grey'} />
          <Text style={styles.dateText}>{selectedDay}</Text>
        </TouchableOpacity>
        {/* Add icon here if needed */}
      </View>

      <Modal
        animationType='slide'
        transparent={true}
        visible={openCalendar}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <DatePicker
            mode='calendar'
            selected={datePickerSelectedDay}
            onDateChange={handleChangeDate}
            />
          <TouchableOpacity onPress={handleOnPressCalendar}>
            <Text style={styles.dateText}>Done</Text>
          </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={flashRed ? styles.flashRed : styles.inputContainer}>
        <View style={styles.dividerText} >
          <MaterialCommunityIcons name="cash-multiple" size={30} left={3} color={'white'} />
          <Text style={{ color: '#407b52', fontWeight: 'bold' }}>{currency == 'EUR' ? 'EUR' : 'RON'}</Text>
        </View>

        <View style={styles.divider} />
        <TextInput
          style={[styles.input, { textAlign: 'right' }]}
          onChangeText={setInputValue}
          value={inputValue}
          placeholder='0'
          defaultValue='0'
          keyboardType='numeric'
          placeholderTextColor={'white'}
          cursorColor={'white'}
          underlineColorAndroid={'transparent'}
          showSoftInputOnFocus={false}
          editable={false}
        // Add other props as needed
        />
        {inputValue !== '' && (
          <TouchableOpacity onPress={clearLastDigit} style={styles.clearButton}>
            <MaterialCommunityIcons name="backspace-outline" size={30} left={15} color={'white'} />
          </TouchableOpacity>
        )}
      </View>

      <TextInput
        style={styles.notesInput}
        onChangeText={setNotesValue} // You need to manage this state separately
        value={notesValue} // You need to manage this state separately
        placeholder="   Add note"
        placeholderTextColor={'#757575'} // Use the hex color that matches your design
      />

      <MaterialCommunityIcons name="fountain-pen-tip" position={'absolute'} size={25} alignSelf={'flex-start'} left={40} top={310} color={'#7ac695'} />

      {isKeypadVisible  ? (
        //keypad    
        <>
          <View style={styles.keypad}>
            {['1', '2', '3', '+', '4', '5', '6', '-', '7', '8', '9', '*', '.', '0', '=', '/'].map((key) => (
              <TouchableOpacity
                key={key}
                style={styles.keypadButton}
                onPress={() => handleKeyPress(key)}
              >
                <Text style={styles.keypadButtonText}>{key}</Text>
              </TouchableOpacity>
            ))}
            {/* ... Repeat for other rows of keys */}

          </View>
        </>) : (
        // flatList
        <>
        <View style={styles.categoryContainer}>
        <FlatList
          data={DATA}
          renderItem={({ item }) =>(
            
              <CategoryButton  {...item} onPress={() => handeCategoryPress(item)} />
            )}
          keyExtractor={item => item.id}
          numColumns={4} // Set the number of columns
          columnWrapperStyle={styles.row} // Style for the row wrapper
          style={styles.flatList} // add this line
        />
        </View>
        </>)
      }
      

      {isKeypadVisible  ?  ( 
        <>
      
        <TouchableOpacity
          style={[styles.chooseCategoryButton1, topStyle]}
          onPress={handleChooseCategory}
        >
          <Text style={styles.chooseCategoryButtonText}>CHOOSE CATEGORY</Text>
        </TouchableOpacity>
          </>
      ):
      (
      
        <TouchableOpacity
          style={[styles.chooseCategoryButton2, bottomStyle]}
          onPress={() => setIsKeypadVisible(!isKeypadVisible)}
        >
          <Text style={styles.chooseCategoryButtonText}>BACK TO KEYPAD</Text>
        </TouchableOpacity>
      
      )
      }
  </KeyboardAvoidingView>
  </>
  );

};

// Styles for your components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '60%',
    marginBottom: 20,
    padding: 10,
    color: 'white',
    left: 10,
    top: 10,
    borderBottomColor: 'transparent', // This hides the underline
    borderBottomWidth: 0, // This hides the underline
    textAlign: 'right',
    fontSize: 32,
    fontFamily: 'Quicksand-SemiBold',
  },
  menuButton: {
    position: 'absolute',
    alignSelf: 'flex-end',
    left: 375,
    top: 49,
    padding: 10,
    zIndex: 1,
  },
  categoryContainer: {
    position: 'absolute',
    flexDirection: 'row', // Align buttons in a row
    flexWrap: 'wrap', // Allow wrapping to next line
    //justifyContent: 'center', // Center buttons horizontally
    marginTop: 20, // Add space between input container and keypad
    top: 550,
    alignItems: 'flex-start',
  },
  flatList: {
    width: '100%', // make sure it's taking up the full width
    backgroundColor: 'transparent', // temporary color to ensure it's rendered
  },
  
  item: {
    borderRadius: 10,
    width: '23%',
    height: 56,
    margin: '1%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', // Adjust the background color as needed
    // Add shadow and other styles as needed
    borderColor: '#7ac695',
    borderBottomWidth: 1,
    borderRightWidth: 1,
  },
  row: {
    justifyContent: 'flex-start',
    marginHorizontal: '1%',
  },
  title:{
    color: 'white',
    fontFamily: 'Quicksand-Bold',
    textAlign: 'center',
    top: 25,
    fontSize: 14,
    width: 100,
  },
  titleCategory: {
    fontFamily: 'Quicksand-Bold',
    textAlign: 'center',
    fontSize: 11,
    width: 90,
    top: 2,
    // Add styles for the title text
  },
  flashRed: {
    position: 'absolute',
    top: 200,
    width: '70%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'red', // The background color in your image
    borderRadius: 20, // Adjust to match your design
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  chooseCategoryButton1: {
    position: 'absolute',
    width: '92%', // Slightly less than 1/4th of the container width
    height: '7%',
    bottom: 5,
    margin: '1%', // Add a little space between the buttons
    justifyContent: 'center', // Center text vertically
    alignItems: 'center', // Center text horizontally
    backgroundColor: '#fff', // Button background color
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
  chooseCategoryButton2: {
    position: 'absolute',
    width: '92%', // Slightly less than 1/4th of the container width
    height: '7%',
    bottom: 320,
    margin: '1%', // Add a little space between the buttons
    justifyContent: 'center', // Center text vertically
    alignItems: 'center', // Center text horizontally
    backgroundColor: '#fff', // Button background color
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
  chooseCategoryButtonText: {
    // Text styling for the 'choose category' button
    fontSize: 18,
    fontFamily: 'Quicksand-Regular',
    // Add additional styling as needed
  },
  category: {
    // Styling for individual category items
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    // Add additional styling as needed
  },
  keypad: {
    position: 'absolute',
    flexDirection: 'row', // Align buttons in a row
    flexWrap: 'wrap', // Allow wrapping to next line
    justifyContent: 'center', // Center buttons horizontally
    marginTop: 20, // Add space between input container and keypad
    top: 540,
  },
  keypadButton: {
    width: '22%', // Slightly less than 1/4th of the container width
    margin: '1%', // Add a little space between the buttons
    aspectRatio: 1, // Makes the buttons have a 1:1 aspect ratio
    justifyContent: 'center', // Center text vertically
    alignItems: 'center', // Center text horizontally
    backgroundColor: '#fff', // Button background color
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
  keypadButtonText: {
    fontSize: 20, // Text size
    fontFamily: 'Quicksand-Bold',
  },
  notesInput: {
    position: 'absolute',
    width: '70%',
    top: 300,
    backgroundColor: 'transparent', // Ensuring the TextInput has no background
    color: '#000', // Text color, change as per your design
    fontSize: 16, // Set the size of your font
    fontFamily: 'Quicksand-Regular',
    fontStyle:'italic',
    borderBottomWidth: 1, // To create the underline effect
    borderBottomColor: '#757575', // Color for the underline
    marginVertical: 15, // Space above and below the text input
    paddingHorizontal: 10, // Space on the sides of the text input
    
  },
  dividerText: {
    left: 10,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  divider: {
    height: '60%', // Adjust the height as needed
    width: 2,
    left: 10,
    backgroundColor: '#ffffff', // Adjust color to match the design
    marginHorizontal: 10, // Space between icon and line, and line and input
  },
  icon: {
    // Style your icon size as needed
    width: 30,
    height: 30,
  },
  clearButton: {
    // Style your clear button as needed
    marginRight: 10,
  },
  inputContainer: {
    position: 'absolute',
    top: 200,
    height: 80,
    width: '70%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7ac695', // The background color in your image
    borderRadius: 20, // Adjust to match your design
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  picker: {
    width: '80%',
    height: 50,
    marginBottom: 20,
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
  dateText: {
    color: 'grey', // Example text color
    marginLeft: 30, // Space between the icon and the text
    fontFamily: 'Quicksand-Medium',
    bottom: 3,
    // Add other styling as needed for the text
  },

  dateContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    justifyContent: 'center',
    //alignItems: 'flex-end',
    flexDirection: 'row',
    padding: 10, // Padding inside the date bar
    backgroundColor: 'transparent', // Example background color
  },
  cancelButton: {
    position: 'absolute',
    left: 15,
    top: 65,
    zIndex: 1,
    // Add styles for the cancel button
  },
  amountDisplay: {
    // Add styles for the amount display section
  },
  currency: {
    // Add styles for the currency display
  },
  amount: {
    // Add styles for the amount display
  },
  noteButton: {
    // Add styles for the add note button
  },
  categoryButton: {
    width: '95%', // Slightly less than 1/4th of the container width
    height: '10%',
    margin: '1%', // Add a little space between the buttons
    borderColor: '#7ac695', // Border color for the buttons
    borderWidth: 1,
    justifyContent: 'center', // Center text vertically
    alignItems: 'center', // Center text horizontally
    backgroundColor: '#fff', // Button background color
    borderRadius: 10, // Rounded corners for buttons
    // Add shadows as per your design
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default AddExpenseScreen;
