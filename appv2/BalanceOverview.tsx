import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, SectionList, LayoutAnimation, UIManager, Platform } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useRealm } from '@realm/react';
import { User } from "./UserSchema";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from "@react-navigation/native";
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


// Define the structure of a single transaction item
interface TransactionProps {
    id: string;
    category: string;
    date: Date;
    amount: number;
    type: string;
    description: string;
    onDelete: (id: string, type: string) => void;
  }
  
  const Transaction: React.FC<TransactionProps> = ({ id, type, category, date, amount, description, onDelete}) => {
    // Convert date to a readable string
    const { currency } = useCurrency();
    const dateString = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    return (
      <View style={styles.transactionContainer}>
        <MaterialCommunityIcons name={type === 'expense' ? 'arrow-bottom-left': 'arrow-top-right' } style={styles.icon} color={type === 'expense' ? "#F62B2E" : "#2E9100"} />
        <View style={styles.details}>
          {/* <Text style={styles.category}>{category}</Text> */}
          <Text style={[styles.amount, {color: type === 'expense' ? "#F62B2E" : "#2E9100"}]}>{currency == 'EUR' ? `€ ${amount.toFixed(2)}` : `RON ${amount.toFixed(2)}`}</Text>
          <Text style={styles.date}>{dateString}</Text>
          <Text style={[styles.description, {fontSize: description === '' ? 0 : 14}]}>{description}</Text>
        </View>
        <TouchableOpacity onPress={() => onDelete(id, type)}>
          <MaterialCommunityIcons name="trash-can-outline" style={styles.deleteIcon} />
        </TouchableOpacity>
      </View>
    );
  };

  interface TransactionData {
    id: string;
    category: string;
    amount: number;
    date: Date;
    type: string;
    description: string;
  }
  
  interface TransactionsListProps {
    transactions: TransactionData[];
    isVisible: boolean;
    onClose: () => void;
    onDelete: (id: string, type: string) => void;

    // Sorting functions should be implemented based on your logic
    //sortByCategory: () => void;
    //sortByDate: () => void;
  }
  interface GroupedTransaction {
    id: string;
    title: string;
    data: TransactionData[];
    total: number;
    type: string;
    count: number;
  }

  const BalanceOverview: React.FC<TransactionsListProps> = ({ isVisible, onClose, transactions, onDelete  }) => {
  const realm = useRealm();
  const [balance, setBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [forceUpdateKey, setForceUpdateKey] = useState(0);
  const [sortByAmount, setSortByAmount] = useState(false);
  const [groupedTransactions, setGroupedTransactions] = useState<GroupedTransaction[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const { currency, toggleCurrency } = useCurrency();

  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const toggleAllCategories = () => {
    if (expandedCategories.length < groupedTransactions.length) {
      // If not all categories are expanded, expand them all
      setExpandedCategories(groupedTransactions.map(group => group.title));
    } else {
      // If all categories are expanded, collapse them all
      setExpandedCategories([]);
    }
  };

  const sortTransactionsByAmount = (
    groupedData: GroupedTransaction[]
  ): GroupedTransaction[] => {
    console.log(groupedData)
    return groupedData.map(group => ({
      ...group,
      data: group.data.slice().sort((a, b) => b.amount - a.amount), // Sorts transactions by amount in descending order
    }));
  };
  
  const sortGroupsByTotalAmount = (groups: GroupedTransaction[]) => {
    return [...groups].sort((a, b) => b.total - a.total); // Sorts groups by total amount in descending order
  };

  const forceUpdate = () => {
    setForceUpdateKey(prevKey => prevKey + 1); // This will change the key and force re-render
  };


  
  useFocusEffect(
    React.useCallback(() => {
      const transactionClones = transactions.map(t => ({ ...t }));
      const updatedGroupedTransactions = transactionClones.reduce((groups, item) => {
        const group = groups.find(g => g.title === item.category);
        if (group) {
          group.data.push({ ...item });  // Clone the item for immutability
          group.total += item.amount;
          group.count++;
        } else {
          groups.push({
            id: item.id,
            title: item.category,
            data: [{ ...item }],
            type: item.type,  // Clone the item for immutability
            total: item.amount,
            count: 1,
          });
        }
        return groups;
      }, [] as GroupedTransaction[]);

      // let updatedGroupedTransactions = transactions.reduce((groups, item) => {
      //   const group = groups.find(g => g.title === item.category);
      //   if (group) {
      //     group.data.push(item);
      //     group.total += item.amount; // Keep a running total for the category
      //     group.count++;
      //   } else {
      //     groups.push({
      //       id: item.id,
      //       title: item.category,
      //       data: [item],
      //       total: item.amount, // Initialize the total with the first item's amount
      //       type: item.type,
      //       count: 1,
      //     });
      //   }
      //   return groups;
      // }, [] as GroupedTransaction[]);

      // if (sortByAmount) {
      //   updatedGroupedTransactions = sortTransactionsByAmount(updatedGroupedTransactions);
      //   updatedGroupedTransactions = sortGroupsByTotalAmount(updatedGroupedTransactions);
      // }
      if (sortByAmount) {
        updatedGroupedTransactions.sort((a, b) => b.total - a.total);
        updatedGroupedTransactions.forEach(group => {
          group.data.sort((a, b) => b.amount - a.amount);
        });
      }
      console.log("TransactionsBalance :",updatedGroupedTransactions)
      setGroupedTransactions(updatedGroupedTransactions);


      //console.log("SET Transactions BalanceOverview: ",groupedTransactions);
      //onTransactionsUpdate(updatedGroupedTransactions);
     
      const newTotalIncome = transactionClones
    .filter(t => t.type === 'income')
    .reduce((sum, current) => sum + current.amount, 0);
  setTotalIncome(newTotalIncome);

  const newTotalExpenses = transactionClones
    .filter(t => t.type === 'expense')
    .reduce((sum, current) => sum + current.amount, 0);
  setTotalExpenses(newTotalExpenses);

  setBalance(newTotalIncome - newTotalExpenses);
      // Optional: if you're using a separate state for the DatePicker format:
      // setDatePickerSelectedDay(DateTime.now().toISODate());
    }, [transactions, sortByAmount])
  );

    // const sortByAmount = (isDescending = true) => {
  //   const sortedGroups = groupedTransactions.map(group => {
  //     const sortedData = group.data.sort((a, b) => {
  //       if (isDescending) {
  //         return b.amount - a.amount;
  //       } else {
  //         return a.amount - b.amount;
  //       }
  //     });
  //     return { ...group, data: sortedData };
  //   });
  
  //   // Now you have to set the new sorted groups to your state or update the UI accordingly.
  //   // For example, if you're storing your grouped transactions in a state:
  //   setGroupedTransactions(sortedGroups);
  // };

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

          <View style={[styles.topBar, {backgroundColor: balance >= 0 ? '#7ac695' : '#C3423F', shadowColor: balance >= 0 ? '#7ac695' : '#C3423F', borderBottomColor: balance >= 0 ? '#7ac695' : '#C3423F'}]}>
            <Text style={styles.BalanceStyle}>{currency == 'EUR' ? `Balance ${balance.toFixed(2)} €`: `Balance ${balance.toFixed(2)} RON`}</Text>
          </View>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.drawerIconSortPrice} onPress={() => setSortByAmount(prevState => !prevState)}>
              <MaterialCommunityIcons name="cash-fast" size={30} color={'white'}/>
            </TouchableOpacity>
            <TouchableOpacity style={styles.drawerIconExpand} onPress={toggleAllCategories}>
              <MaterialCommunityIcons name="arrow-expand-all" size={30} color={'white'}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={{ zIndex:1, bottom: 5}}>
              <Text style={{fontSize: 15, color: 'white'}}>Close</Text>
            </TouchableOpacity>
          </View>


          <SectionList
          key={forceUpdateKey}
  keyExtractor={(item, index) => item.id.toString() + index.toString()}
  sections={groupedTransactions}
  renderItem={({ item, section }) => {
    // Only render items if their category is in the expandedCategories array
    if (expandedCategories.includes(section.title) && !realm.isClosed) {
      return (
        <Transaction
          category={item.category}
          amount={item.amount}
          date={item.date}
          id={item.id}
          type={item.type}
          description={item.description}
          onDelete={(id, type) => { onDelete(id, type); forceUpdate(); }}
        />
      );
    }
    return null;
  }}
  renderSectionHeader={({ section: { title, total, type, count } }) => (
    <TouchableOpacity
      onPress={() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedCategories(current => {
          const isExpanded = current.includes(title);
          return isExpanded
            ? current.filter(category => category !== title)
            : [...current, title];
        });
      }}
      style={styles.headerContainer}
    >
      <View style={styles.header}>
      <MaterialCommunityIcons
          name={expandedCategories.includes(title) ? "chevron-up" : "chevron-down"}
          size={24}
          color="#747578"
          
        />
        <MaterialCommunityIcons
        name={categoryIcons[title]}
        size={28}
        color={categoryColors[title]}
        style={{left:5}}
        />
        <Text style={[styles.headerText, {color: categoryColors[title]}]}>{title}</Text>

        <View style={[styles.transactionCount, {backgroundColor: type === 'expense' ? '#f47d74' : '#71d297',}]}>
          <Text style={styles.transactionCountText}>{count}</Text>
        </View>
      </View>

      

      <Text style={[styles.totalText, {color: type === 'expense' ? "#F62B2E" : "#2E9100"}]}>
      {currency == 'EUR' ? `€ ${total.toFixed(2)}`: `RON ${total.toFixed(2)}`} 
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
};

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
      borderBottomWidth: 1, // Example border
      //borderBottomColor: '#7ac695', // Example border color
      shadowColor: 'green',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 15,
    },
    BalanceStyle: {
      // Styles for your date filter text
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
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
      left: 30,
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
    },
    headerText: {
      fontSize: 18,
      fontWeight: 'bold',
      marginRight: 10,
      left: 15,
    },
    totalText: {
      fontSize: 18,
      fontWeight: 'bold',
      // You can adjust the style to match your design
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
    transactionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#E2E2E2',
    },
    icon: {
      bottom: 10,
      left: 30,
      fontSize: 25,
      width: 50, // Ensure the icon has a set width for alignment
      shadowColor: 'green',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 10,
    },
    details: {
      flex: 1,
      left: 10,
    },
    description: {
      color: '#554640',
    },
    amount: {
      fontSize: 16,
      fontWeight: 'bold',
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
  
  export default BalanceOverview;