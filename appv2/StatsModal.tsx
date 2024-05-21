import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, SectionList, LayoutAnimation, UIManager, Platform } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useRealm } from '@realm/react';
import { User } from "./UserSchema";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from "@react-navigation/native";
import Octicons from 'react-native-vector-icons/Octicons';
import { useCurrency } from "./CurrencyContext";

const categoryColors = {
    'Health': 'red',
    'Personal Care': '#27C5AD',
    'Education': '#36453B',
    'Bills': '#BA2B05',
    'House': '#313B3B',
    'Utilities': '#00008B',
    'Clothes': '#6622CC',
    'Transport': '#be2596',
    'Groceries': '#9ACD32',
    'Rent': '#847979',
    'Travel': '#8EA604',
    'Electronics': 'black',
    'Sports': '#FF8811',
    'Gifts': '#1DE713',
    'Car': '#40E0D0',
    'Shopping': '#9191E9',
    'Eating Out': '#B49A67',
    'Entertainment': '#301014',
    'Pets': '#F6F930',
    'Beauty': '#B8860B',
    'Deposits': '#18A999',
    'Salary': '#49be25',
    'Savings': '#BA2B05',
    // Add more categories and their corresponding colors here
  };
  
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
    'Deposits': 'bank-transfer',
    'Salary': 'cash-multiple',
    'Savings': 'piggy-bank-outline',
    // Add more categories and their corresponding icons here
  };

interface TransactionProps {
    id: string;
    category: string;
    date: Date;
    amount: number;
    type: string;
    description: string;
    maxAmount: number;
  }
  
  const Transaction: React.FC<TransactionProps> = ({ id, type, category, date, amount, maxAmount}) => {
    const widthPercentage = (amount / maxAmount) * 100;
    const { currency } = useCurrency();
    return (
      <View style={styles.transactionContainer}>
         <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${widthPercentage}%`, backgroundColor: type === 'expense' ? "#DCBCC0" : "#A7CCA3" }]} />
      </View>
        <View style={styles.details}>
        <Octicons name={'dot-fill'} style={styles.icon} color={type === 'expense' ? "#F62B2E" : "#2E9100"} />
          <Text style={[styles.category, {fontFamily:'Quicksand-SemiBold'}, {color: categoryColors[category]}]}>{category}</Text>
          <Text style={[styles.amount, , {color: type === 'expense' ? "#F62B2E" : "#2E9100"}]}>{currency == 'EUR' ? `€ ${amount.toFixed(2)}` : `RON ${amount.toFixed(2)}`}</Text>
        </View>
      </View>
    );
  };

interface TransactionData {
    id: string;
    category: string;
    date: Date;
    amount: number;
    type: string;
    description: string;
    dayTotal: number;
  }
  

interface TransactionsListProps {
    transactions: TransactionData[];
    isVisible: boolean;
    onClose: () => void;
  }
  interface GroupedTransaction {
    id: string;
    title: string;
    data: TransactionData[];
    date: string;
    total: number;
    type: string;
    count: number;
    formattedDate: string;
    balance: number;
    maxAmount: number;
  }
const StatsModal: React.FC<TransactionsListProps> = ({isVisible, onClose, transactions}) => {

    const realm = useRealm();
    const [balance, setBalance] = useState(0);
    const [totalIncome, setTotalIncome] = useState(0)
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [forceUpdateKey, setForceUpdateKey] = useState(0);
    const [sortByAmount, setSortByAmount] = useState(false);
    const [groupedTransactions, setGroupedTransactions] = useState<GroupedTransaction[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
    const { currency } = useCurrency();
    
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    const toggleAllCategories = () => {
        if (expandedCategories.length < groupedTransactions.length) {
          // If not all categories are expanded, expand them all
          setExpandedCategories(groupedTransactions.map(group => group.date));
        } else {
          // If all categories are expanded, collapse them all
          setExpandedCategories([]);
        }
      };

      useFocusEffect(
        React.useCallback(() => {
    
            let updatedGroupedTransactions = transactions.reduce((groups, item) => {
                // Assuming item.date is a Date object, format it to a string as 'YYYY-MM-DD'
                const dateString = item.date.toISOString().split('T')[0];
                const dateObject = new Date(item.date);
                const formattedDate = dateObject.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });
              
                // Find a group where the date string matches
                const group = groups.find(g => g.formattedDate === formattedDate);
              
                if (group) {
                    group.data.push(item);
                    // Adjust the total based on the type of transaction
                    // Adjust the total based on the type of transaction
                    group.total = item.type === 'expense' ? group.total - item.amount : group.total + item.amount;
                    group.balance = item.type === 'expense' ? group.balance - item.amount : group.balance + item.amount;
                    // Update maxAmount to the largest transaction amount of the day
                    group.maxAmount = Math.max(group.maxAmount, item.amount);
                    group.count++;
                } else {
                    groups.push({
                        id: item.id,
                        title: item.category,
                        data: [item],
                        date: item.date.toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                        }), // Assign the formatted date string
                        formattedDate: formattedDate,
                        total: item.type === 'expense' ? -item.amount : item.amount, // Initialize total based on type
                        type: item.type,
                        count: 1,
                        balance: item.type === 'expense' ? -item.amount : item.amount,
      maxAmount: item.amount, // Initialize maxAmount to the first item's amount
                    });
                }
                return groups;
              }, [] as GroupedTransaction[]);
    
          
          setGroupedTransactions(updatedGroupedTransactions);
        console.log('Transactions', transactions);
    
          // Optional: if you're using a separate state for the DatePicker format:
          // setDatePickerSelectedDay(DateTime.now().toISODate());
        }, [transactions, sortByAmount])
      );

return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>

      <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
    <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>

          <View style={[styles.topBar]}>
            <Text style={styles.BalanceStyle}> Summary </Text>
          </View>
          <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={{zIndex:1, bottom: 5}}>
              <Text style={{fontSize: 15, color: 'white', fontFamily: 'Quicksand-Regular'}}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.drawerIconExpand} onPress={toggleAllCategories}>
              <MaterialCommunityIcons name="arrow-expand-all" size={30} color={'white'}/>
            </TouchableOpacity>
            </View>
            <SectionList
  keyExtractor={(item, index) => item.id + index}
  sections={groupedTransactions} // Use your updated grouped transactions array
  renderItem={({ item, section }) => {
    // Only render items if their category is in the expandedCategories array
    if (expandedCategories.includes(section.date)) {
        return (
          <Transaction
            category={item.category}
            amount={item.amount}
            date={item.date}
            id={item.id}
            type={item.type}
            description={item.description}
            maxAmount={section.maxAmount}
          />
        );
      } else {
        // If the section's date is not in expandedCategories, render nothing
        return null;
      }
  }}
  renderSectionHeader={({ section: { date, total, type, count } }) => (
    <TouchableOpacity
      onPress={() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  setExpandedCategories(current => {
    const isExpanded = current.includes(date);
    if (isExpanded) {
      return current.filter(d => d !== date);
    } else {
      return [...current, date];
    }
  });
      }}
      style={styles.headerContainer}
    >
      <View style={styles.header}>
        {/* Conditional rendering for chevron icons */}
        <MaterialCommunityIcons
          name={expandedCategories.includes(date) ? "chevron-up" : "chevron-down"}
          size={24}
          color="#747578"
        />
        <Text style={styles.headerText}>{date}</Text>
        <View style={[styles.transactionCount, {backgroundColor: total < 0 ? '#f47d74' : '#71d297'}]}>
          <Text style={styles.transactionCountText}>{count}</Text>
        </View>
      </View>
      <Text style={[styles.totalText, {color: total < 0 ? "#F62B2E" : "#2E9100"}]}>
        {currency == 'EUR' ? `€ ${total.toFixed(2)}` : `RON ${total.toFixed(2)}`}
      </Text>
    </TouchableOpacity>
  )}
/>
          </View>
          </View>
    </Modal>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    topBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderTopEndRadius: 20,
      borderTopStartRadius: 20,
      padding: 10, // Padding inside the top bar
      zIndex: 0, // Ensure the top bar is above other elements
      backgroundColor: '#7ac695', // Example background color
      //borderBottomWidth: 1, // Example border
      //borderBottomColor: '#7ac695', // Example border color
      shadowColor: 'green',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 15,
    },
    totalText: {
        fontSize: 19,
        fontFamily: 'Quicksand-Bold',
        // You can adjust the style to match your design
      },
    icon: {
        bottom: 1,
        left: 20,
        fontSize: 25,
        width: 50, // Ensure the icon has a set width for alignment
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 10,
      },
      progressBarContainer: {
        ...StyleSheet.absoluteFillObject, // This will expand the container to fill the entire parent
        backgroundColor: 'rgba(0,0,0,0.1)', // Light grey for the unfilled part of the bar
        justifyContent: 'flex-start', // Align children to the start of the main axis
        borderRadius: 20,
      },
      progressBar: {
        height: '100%', // Full height of the container
        backgroundColor: '#345830', // Green color for the filled part
        maxWidth: '100%', // Ensure the bar doesn't exceed the parent's width
        borderRadius: 20,
      },
    transactionContainer: {
        flexDirection: 'row', // Align children in a row
        alignItems: 'center', // Center items vertically
        paddingVertical: 4,
        padding: 20, // Adjust padding as needed.
        marginVertical: 2,

      },
      transactionCount: {
        width: 20, // Adjust size as necessary
        height: 20, // Adjust size as necessary
        borderRadius: 10, // Half of width/height to make a circle
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12, // Adjust as necessary
      },
      transactionCountText: {
        color: 'white',
        fontSize: 12, // Adjust as necessary
        fontWeight: 'bold',
      },
      category: {
        position: 'absolute',
        left: 50,
        bottom: 2,
        fontSize: 17,
      },
      amount: {
        position: 'absolute',
        fontSize: 16,
        color: '#666',
        right: -20,
        top: 0,
        fontFamily: 'Quicksand-SemiBold',
      },
      details: {
        flex: 1,
        marginHorizontal: 10,
        marginVertical: 1,
      },
    BalanceStyle: {
      // Styles for your date filter text
      color: 'white',
      fontSize: 20,
      fontFamily: 'Quicksand-Medium',
    },
    drawerIconSortPrice: {
      position: 'absolute',
      bottom: 0,
      left: -10,
      zIndex: 1, // Ensure the icon is above other elements
      // Styles for your drawer icon
    },
    drawerIconExpand: {
      position: 'absolute',
      bottom: 0,
      left: 10,
      zIndex: 1,
    },
    headerContainer: {
      //paddingTop:1,
      top: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
      backgroundColor: 'transparent',
      //borderBottomWidth: 1,
      //borderBottomColor: '#E2E2E2',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      shadowColor: "red",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    },
    headerText: {
      fontSize: 18,
      fontFamily: 'Quicksand-Bold',
      marginRight: 10,
      left: 15,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
      },
      colorIndicator: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 8,
      },
      categoryText: {
        flex: 1, // Takes up as much space as possible
        fontSize: 16,
      },
      amountText: {
        fontSize: 16,
        color: '#666', // Grey color for the amount text
        marginRight: 4,
      },
      percentageText: {
        fontSize: 16,
        color: '#666', // Grey color for the percentage text
      },
    date: {
      fontSize: 14,
      color: 'black',
      padding: 2,
      fontWeight: '500'
    },
    deleteIcon: {
      fontSize: 24,
      color: 'red',
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 22,
    },
    modalContent: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 600, // Adjust the height as needed
      backgroundColor: 'white',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      // Shadow properties for iOS
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      // Elevation for Android
      elevation: 5,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    topSection: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: 10, // Padding inside the top bar
      zIndex: 0, // Ensure the top bar is above other elements
      backgroundColor: '#7ac695', // Example background color
      borderBottomWidth: 2, // Example border
      borderBottomColor: '#407b52', // Example border color
    },
    menuButton: {
      position: 'absolute',
      alignSelf: 'flex-end',
      left: 350,
      bottom:-8,
      padding: 10,
      zIndex: 1,
    },
    cancelButton: {
      position: 'absolute',
      left: 15,
      // Add styles for the cancel button
    },
    title:{
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: 14,
      width: 150,
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
    transactionItem: {
      flexDirection: 'row', // To align items in a row
      alignItems: 'center', // To center items vertically
      justifyContent: 'space-between', // To distribute space evenly
      padding: 10,
      // Add additional styling for transaction items
    },

    categoryName: {
      // Text styling for the category name
    },

    deleteButton: {
      // Styling for the delete button
   },
    deleteButtonText: {
      // Text styling for the delete button text
    },
    // ... more styles
  });
  
export default StatsModal;