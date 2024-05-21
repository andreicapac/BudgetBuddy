
import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, ActivityIndicator, Dimensions, StatusBar, Image } from 'react-native';
import { AuthContext } from './AuthContext';
import { useRealm } from '@realm/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { User } from './UserSchema';
import DoughnutChart from './DoughnutChart';
import { useIsFocused } from '@react-navigation/native';
import { DateFilterContext } from './DateFilterContext';
import { useFocusEffect } from '@react-navigation/native';
import { DateTime } from 'luxon';
import Swiper from 'react-native-swiper';
import { to } from 'mathjs';
import SwiperClass from 'react-native-swiper'
import { categoryIcons } from './DoughnutChart';
import { ScrollView } from 'react-native-gesture-handler';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import BalanceOverview from './BalanceOverview';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatsModal from './StatsModal';
import { AlertNotificationRoot, Toast, ALERT_TYPE } from 'react-native-alert-notification';
import { useCurrency } from './CurrencyContext';

const HomeScreen = ({ navigation }) => {
  const { currency, toggleCurrency } = useCurrency();
  const realm = useRealm();
  const [chartData, setChartData] = useState([]);
  const [balance, setBalance] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [income, setIncome] = useState(0);
  const isFocused = useIsFocused();
  const { openLeftDrawer } = useContext(DateFilterContext);
  const [dateFilter, setDateFilter] = useState('');
  const [currentPeriodSlide, setCurrentPeriodSlide] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [allPeriodsChartData, setAllPeriodsChartData] = useState([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [currentSwipeIndex, setCurrentSwipeIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const swiperRef = useRef<SwiperClass>();
  const screenWidth = Dimensions.get('window').width;
  const scrollViewRef = useRef(null);
  const [balancePositive, setBalancePositive] = useState(false);
  const [modalVisible, setBalanceModalVisible] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [numberExpenses,setNumberExpenses] = useState(0);
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [visibleLabels, setVisibleLabels] = useState<{ [category: string]: boolean }>(
    chartData.reduce((acc, item) => ({ ...acc, [item.x]: false }), {}) // Initialize all labels as not visible
  );
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [suggestion, setSuggestion] = useState('');

  const toggleLabel = useCallback((key: string) => {
    setVisibleLabels((currentLabels) => {
      const updatedLabels = { ...currentLabels, [key]: !currentLabels[key] };
      //console.log(updatedLabels); // Debugging line
      return updatedLabels;
    });
  }, []);

  const toggleBalanceModal = () => {
    setBalanceModalVisible(!modalVisible);
  };

  const toggleSuggestions = () => {
    setSuggestionsVisible(!suggestionsVisible);
  };

  const toggleStatsModal = () => {
    setStatsModalVisible(!statsModalVisible);
  };

  const generateYears = () => {
    const now = DateTime.now();
    const currentYear = now.year;
    let years = [];
    for (let year = currentYear; year >= currentYear - 2; year--) {
      const yearStart = DateTime.local(year);
      years.push({
        date: yearStart,
        isCurrentYear: year === currentYear,
      });
    }
    return years.reverse();
  };
  const generateMonths = () => {
    const now = DateTime.now();
    let months = [];
    for (let month = 1; month <= now.month; month++) {
      // Create a DateTime object for the start of each month
      let monthStart = DateTime.local(now.year, month).startOf('month');
      // Push an object with the date and whether it's the current month
      months.push({
        date: monthStart,
        isCurrentMonth: monthStart.hasSame(now, 'month')
      });
    }
    // If you need the array in reverse order (most recent first)
    return months;
  };

  const generateWeeks = () => {
    const now = DateTime.now();
    let current = DateTime.local(now.year, now.month).startOf('month').startOf('week');
    const endOfMonth = DateTime.local(now.year, now.month).endOf('month');
    let weeks = [];
  
    while (current <= endOfMonth) {
      let weekStart = current;
      let weekEnd = current.endOf('week');
      
      // Check if the current date is within the start and end of the week
      const isCurrentWeek = now >= weekStart && now <= weekEnd;
  
      weeks.push({ 
        start: weekStart, 
        end: weekEnd,
        isCurrentWeek: isCurrentWeek 
      });
  
      current = weekEnd.plus({ days: 1 }).startOf('week');
    }
  
    return weeks;
  };

  const generateDays = () => {
    const now = DateTime.now();
    let days= [];
    let current = DateTime.local(now.year, now.month).startOf('month');
    const endOfMonth = DateTime.local(now.year, now.month).endOf('month');
  
    while (current <= endOfMonth) {
      days.push({
        date: current,
        isToday: current.hasSame(DateTime.now(), 'day')
      });
      current = current.plus({ days: 1 });
    }
    
    return days;

  };

  const findCurrentIndex = (periods, dateFilter) => {
    const today = DateTime.now();
    
    let currentIndex;
  
    switch (dateFilter) {
      case 'day':
        currentIndex = periods.findIndex(period => period.date.hasSame(today, 'day'));
        break;
      case 'week':
        currentIndex = periods.findIndex(period => 
          today.startOf('week').hasSame(period.start, 'day') && 
          today.endOf('week').hasSame(period.end, 'day')
        );
        break;
      case 'month':
        currentIndex = periods.findIndex(period => 
          today.hasSame(period.date.startOf('month'), 'month')
        );
        break;
      case 'year':
        currentIndex = periods.findIndex(period => 
          today.hasSame(period.date.startOf('year'), 'year')
        );
        break;
      default:
        currentIndex = -1;
    }
  
    return currentIndex !== -1 ? currentIndex : 0; // Return 0 as a default if current period is not found
    
  };

  const renderPeriodSlides = () => {
    return periods.map((period, index) => {
      const chartContent = isLoading ? (
        <ActivityIndicator size="large" color="#4DAA57" />
      ) : (

        <View style={styles.slideChartInfo}>
          <DoughnutChart 
            chartData={chartData} 
            toggleLabel={toggleLabel}
            visibleLabels={visibleLabels}/>
          <Text style={styles.periodText}>{formatPeriodDisplay(period, dateFilter)}</Text>
          <Text style={styles.infoTextIncome}>{currency == 'EUR' ? `€ ${income.toFixed(2)}` : `RON ${income.toFixed(2)}`}</Text>
          <Text style={styles.infoTextExpense}>{currency == 'EUR' ? `€ ${expenses.toFixed(2)}` : `RON ${expenses.toFixed(2)}`}</Text>
          <Text style={styles.numberExpenses}> {numberExpenses}</Text>
          <Text style={styles.numberExpensesText}> Expenses</Text>
          <View style={{position: 'absolute', alignSelf:'center', bottom: 32, left:40, height: 60, width: 60}}>
          <TouchableOpacity style={styles.buttonSuggestions} onPress={() => {toggleSuggestions();}}>
            <Image source={require('../assets/logo2.png')} tintColor={'#7ac695'} resizeMode='stretch' style={{ width: 100, height: 100, position: 'absolute', alignSelf: 'center' }}/>
          </TouchableOpacity>
          </View>
          {suggestionsVisible && (
          <View style={[styles.suggestion, {borderColor: balance >= 0 ? '#7ac695' : '#E04E15'}]}>
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </View>)}
          <TouchableOpacity style={[styles.buttonBalance, {backgroundColor: balancePositive ? '#036D19': '#C3423F'}]} onPress={() => {toggleBalanceModal(); }}>
            <Text style={[styles.infoTextBalance]}>{currency == 'EUR' ? `Balance ${balance.toFixed(2)} EUR` : `Balance ${balance.toFixed(2)} RON`}</Text>
          </TouchableOpacity>

        </View>

      );
  
      return (
        <View key={index} style={styles.slide}>
          {chartContent}
        </View>
      );
    });
  };

  const renderIncomeExpense = () => {
      return(
          <View style={styles.balanceContainer}>

          </View>
      );
  };

  /**
 * Formats the display string for a period based on the current date filter.
 * @param {Object} period - The period object containing date information.
 * @param {string} dateFilter - The current date filter ('year', 'month', 'week', 'day').
 * @returns {string} - The formatted display string for the period.
 */
const formatPeriodDisplay = (period , dateFilter )=> {
  switch (dateFilter) {
    case 'year':
      // Assuming period is a DateTime object representing the start of the year
      return period.date.toFormat('yyyy');
    case 'month':
      // Assuming period is a DateTime object representing the start of the month
      return period.date.toFormat('MMMM yyyy');
    case 'week':
      // Assuming period is an object with start and end DateTime properties for the week
      // You might need to adjust this based on your actual period object structure
      return `${period.start.toFormat('dd')} - ${period.end.toFormat('dd LLLL')}`;
    case 'day':
      // Assuming period is a DateTime object representing the day
      //const format = period.setLocale('en').toFormat('cccc, LLL dd');
      return period.date.toFormat('ccc, dd LLLL')
    default:
      return 'Unknown period';
  }
};

const renderPagination = (index, total, context) => {
  let formattedPrevDate = '';
  let formattedNextDate = '';

  // --- IMPLEMENT THE DISPLAY TEXT FOR EACH DATE FILTER ---
  if (index > 0) { // Check if prevPeriod exists
    const prevPeriod = periods[index - 1];
    switch (dateFilter) {
      case 'day':
        formattedPrevDate = prevPeriod.date.toFormat('ccc, dd LLLL');
        break;
      case 'month':
        formattedPrevDate = prevPeriod.date.toFormat('LLLL yyyy');
        break;
      case 'year':
        formattedPrevDate = prevPeriod.date.toFormat('yyyy');
        break;
      case 'week':
        formattedPrevDate = `${prevPeriod.start.toFormat('dd')} - ${prevPeriod.end.toFormat('dd LLLL')}`;
        break;
      default:
        formattedPrevDate = 'Unknown Date';
    }
  }

  if (index < total - 1) { // Check if nextPeriod exists
    const nextPeriod = periods[index + 1];
    switch (dateFilter) {
      case 'day':
        formattedNextDate = nextPeriod.date.toFormat('ccc, dd LLLL');
        break;
      case 'month':
        formattedNextDate = nextPeriod.date.toFormat('LLLL yyyy');
        break;
      case 'year':
        formattedNextDate = nextPeriod.date.toFormat('yyyy');
        break;
      case 'week':
        formattedNextDate = `${nextPeriod.start.toFormat('dd')} - ${nextPeriod.end.toFormat('dd LLLL')}`;
        break;
      default:
        formattedNextDate = 'Unknown Date';
    }
  }

  return (
    <View>
      {index > 0 && ( // Only render prev button if prevPeriod exists
        <TouchableOpacity style={styles.buttonNextPrevDate} onPress={() => context.scrollBy(-1)}>
          <Text style={styles.paginationText1}>{formattedPrevDate}</Text>
        </TouchableOpacity>
      )}
      {index < total - 1 && ( // Only render next button if nextPeriod exists
        <TouchableOpacity style={styles.buttonNextPrevDate} onPress={() => context.scrollBy(1)}>
          <Text style={styles.paginationText2}>{formattedNextDate}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const fetchTransactionsAllTime = useCallback(async () => {
  const token = await AsyncStorage.getItem('userToken');
  const users = realm.objects<User>('User').filtered(`token == "${token}"`);
  const user = users.length > 0 ? users[0] : null;
  if (!user) {
    console.error('No user found');
    return;
  }

  const selectedCategoryNames = user.expensesCategories.filtered('isSelected == true').map(cat => cat.name);
      const selectedIncomeCategoryNames = user.incomeCategories.filtered('isSelected == true').map(cat => cat.name);
      const selectedCategories = [...selectedCategoryNames, ...selectedIncomeCategoryNames];
      const allTrasanctions = user.transactions.filtered('category IN $0', selectedCategories);
      setTransactions(Array.from(allTrasanctions));

}, [realm, dateFilter, transactions, setTransactions]);

const fetchTransactionsForPeriod = useCallback(async (currentPeriod) => {

  const token = await AsyncStorage.getItem('userToken');
  const users = realm.objects<User>('User').filtered(`token == "${token}"`);
  const user = users.length > 0 ? users[0] : null;

  if (!currentPeriod || !realm) return;

  if (!user) {
    console.error('No user found');
    return;
  }

    // Determine the start and end dates for the current period.
    let startDate, endDate;
    if (currentPeriod && dateFilter !== 'all') {
      switch (dateFilter) {
        case 'year':
          startDate = currentPeriod.date.startOf('year').toJSDate();
          endDate = currentPeriod.date.endOf('year').toJSDate();
          break;
        case 'month':
          startDate = currentPeriod.date.startOf('month').toJSDate();
          endDate = currentPeriod.date.endOf('month').toJSDate();
          break;
        case 'week':
          startDate = currentPeriod.start.startOf('week').toJSDate();
          endDate = currentPeriod.end.endOf('week').toJSDate();
          break;
        case 'day':
          startDate = currentPeriod.date.startOf('day').toJSDate();
          endDate = currentPeriod.date.endOf('day').toJSDate();
          break;
        default:
          console.error('Unknown date filter:', dateFilter);
          return;
      }
    } else {
      // Handle 'all' date filter or unspecified period by not filtering by dates
    }
    if (startDate && endDate) {
      const selectedCategoryNames = user.expensesCategories.filtered('isSelected == true').map(cat => cat.name);
      const selectedIncomeCategoryNames = user.incomeCategories.filtered('isSelected == true').map(cat => cat.name);
      const selectedCategories = [...selectedCategoryNames, ...selectedIncomeCategoryNames];
      const allTrasanctions = user.transactions.filtered('date >= $0 AND date <= $1 AND category IN $2', startDate, endDate, selectedCategories);
      setTransactions(Array.from(allTrasanctions));
      //console.log("Transactions HomeScreen: ", allTrasanctions);
    }

  }, [realm, dateFilter, transactions, setTransactions]);
  
const fetchAndUpdateChartDataForPeriod = useCallback(async (currentPeriod) => {
  const token = await AsyncStorage.getItem('userToken');
  const users = realm.objects<User>('User').filtered(`token == "${token}"`);
  const user = users.length > 0 ? users[0] : null;

  if (!currentPeriod || !realm) return;

  if (!user) {
    console.error('No user found');
    return;
  }

  // Determine the start and end dates for the current period.
  let startDate, endDate;
  if (currentPeriod && dateFilter !== 'all') {
    switch (dateFilter) {
      case 'year':
        startDate = currentPeriod.date.startOf('year').toJSDate();
        endDate = currentPeriod.date.endOf('year').toJSDate();
        break;
      case 'month':
        startDate = currentPeriod.date.startOf('month').toJSDate();
        endDate = currentPeriod.date.endOf('month').toJSDate();
        break;
      case 'week':
        startDate = currentPeriod.start.startOf('week').toJSDate();
        endDate = currentPeriod.end.endOf('week').toJSDate();
        break;
      case 'day':
        startDate = currentPeriod.date.startOf('day').toJSDate();
        endDate = currentPeriod.date.endOf('day').toJSDate();
        break;
      default:
        console.error('Unknown date filter:', dateFilter);
        return;
    }
  } else {
    // Handle 'all' date filter or unspecified period by not filtering by dates
  }

  // Fetch and process income entries
  if (startDate && endDate) {
    
    const selectedIncomeCategories = user.incomeCategories.filtered('isSelected == true');

    let totalIncome = 0;
    selectedIncomeCategories.forEach(category => {
      const incomeEntries = category.income.filtered('date >= $0 AND date <= $1', startDate, endDate);
      totalIncome += incomeEntries.sum('amount');
    });
    // Assuming startDate and endDate are JavaScript Date objects
    //const incomeEntries = user.incomeEntries.filtered('date >= $0 AND date <= $1', startDate, endDate);
    //const totalIncome = incomeEntries.sum('amount');
  

    // Filtering categories that are selected and then summing their expenses within the date range
    const selectedCategories = user.expensesCategories.filtered('isSelected == true');
    let selectedAndNonZeroCategories = [];

    selectedCategories.forEach(cat => {
      const expensesForCategory = cat.expenses.filtered('date >= $0 AND date <= $1', startDate, endDate);
      const totalAmountForCategory = expensesForCategory.sum('amount');
      if (totalAmountForCategory > 0) {
        selectedAndNonZeroCategories.push({
          x: cat.name,
          y: totalAmountForCategory,
          label: `${cat.name}\n${totalAmountForCategory}`,
          //label: `${cat.name}\n (${percentage.toFixed(2)}%)`
        });
      }
    });
    setNumberExpenses(selectedAndNonZeroCategories.length)
    const totalExpenses = selectedAndNonZeroCategories.reduce((sum, cat) => sum + cat.y, 0);
    const currentBalance = totalIncome - totalExpenses;
    //console.log('Selected and non-zero categories:', selectedAndNonZeroCategories)
    // const chartDataWithIcons = selectedAndNonZeroCategories.map(cat => ({
    //   ...cat,
    //   icon: categoryIcons[cat.x] || 'account-alert',  // Use a default icon as fallback
    // }));

    selectedAndNonZeroCategories = selectedAndNonZeroCategories.map((cat, index) => {
      const percentage = (cat.y / totalExpenses) * 100;
      return {
        ...cat,
        y: percentage, // This will use the percentage for the y-axis value
        //label: `${cat.x}\n${percentage.toFixed(2)}%`, // Update label to show percentage
        //label: `${cat.x}`,
        amount: cat.y,
        index,
        label: visibleLabels[index] ? `${cat.x}\n${percentage.toFixed(2)}%` : "", // Conditionally show label
        icon: categoryIcons[cat.x] || 'account-alert' // Use a default icon as fallback
      };
    });

    //console.log('Chart data with icons:', chartDataWithIcons)
    setChartData(selectedAndNonZeroCategories);
    setBalance(currentBalance);
    setIncome(totalIncome);
    setExpenses(totalExpenses);
  }
}, [realm, dateFilter, currency, toggleCurrency]);

  const fetchAndUpdateChartData = useCallback(async () => {
    const token = await AsyncStorage.getItem('userToken');
    const users = realm.objects<User>('User').filtered(`token == "${token}"`);
    const user = users.length > 0 ? users[0] : null;
  
    if (user) {
      // Sum up all expenses from the user's categories
      //const totalIncome = user.incomeEntries.sum('amount');
      
      const totalIncome = user.incomeCategories
        .filter(cat => cat.isSelected)
        .reduce((sum, cat) => sum + cat.income.sum('amount'), 0);

      // Sum up all expenses from the ExpenseEntry objects in selected categories
      const totalExpenses = user.expensesCategories
        .filter(cat => cat.isSelected)
        .reduce((sum, cat) => sum + cat.expenses.sum('amount'), 0);

      // Calculate the balance
      const currentBalance = totalIncome - totalExpenses;
  
      const selectedAndNonZeroCategories = user.expensesCategories
      .filter(cat => cat.isSelected && cat.expenses.sum('amount') > 0)
      .map(cat => {
        const categoryTotal = cat.expenses.sum('amount');
        const percentage = (categoryTotal / totalExpenses) * 100;
        return {
          x: cat.name,
          y: percentage,  // Use percentage for y-axis
          amount: categoryTotal,  // Include the total amount for the category
          
          //label: `${cat.name}\n${categoryTotal} (${percentage.toFixed(2)}%)`  // Updated label to show percentage
          //label: `${percentage.toFixed(2)}%`  // Updated label to show percentage
          //label: `${cat.name}\n${percentage.toFixed(2)}%`
          label: `${cat.name}`
        };
      });

      setNumberExpenses(selectedAndNonZeroCategories.length)
      const chartDataWithIcons = selectedAndNonZeroCategories.map(cat => ({
        ...cat,
        icon: categoryIcons[cat.x] || 'account-alert',  // Use a default icon as fallback
        currency: currency,
      }));

      setChartData(chartDataWithIcons);
      setBalance(currentBalance);
      setIncome(totalIncome);
      setExpenses(totalExpenses);
    }
  }, [realm, dateFilter]);

  

  // Fetch the current date filter from AsyncStorage
 const fetchDateFilter = async () => {
  try {
    const filter = await AsyncStorage.getItem('dateFilter');
    if (filter) {
      setDateFilter(filter);
      switch (dateFilter) {
        case 'year':
          const years = generateYears();
          setPeriods(years);
          //console.log(periods);
          break;
        case 'month':
          const months = generateMonths();
          setPeriods(months);
          //console.log(periods);
          break;
        case 'week':
          const weeks = generateWeeks();
          setPeriods(weeks);
          console.log(periods);
          break;
        case 'day':
          const days = generateDays();
          setPeriods(days);
          //console.log(periods);
          break;
        default:
          setPeriods([]);
      }
    }
  } catch (error) {
    console.error('Failed to fetch the date filter: ', error);
  }
};

// HANDLE THE INDEX SWIPE ACTION AND FETCH DATA FOR THE NEW PERIOD !!!


const handleSwipe = useCallback((index) => {
  setCurrentSwipeIndex(index); // Update based on the swipe
  const currentPeriod = periods[index];
  if (currentPeriod) {
    fetchAndUpdateChartDataForPeriod(currentPeriod); // Fetch data for the new period
  }
}, [periods, fetchAndUpdateChartDataForPeriod]);

 function goToCurrentDateSlide (): void {
  const todayIndex = findCurrentIndex(periods, dateFilter);
  console.log('Today index:', todayIndex)
  if (swiperRef.current !== undefined) {
    swiperRef.current.scrollTo(Number(todayIndex));
  }
  else {
    console.log('Swiper ref is undefined');
  }
 }

const setBalanceColor = async() => {
  if(balance >= 0)
    {
      setBalancePositive(true);
    }
    else
    {
      setBalancePositive(false);
    }
}

useFocusEffect(
  useCallback(() => {
    fetchDateFilter().then(() => {
      // Once the date filter is fetched, update chart data accordingly


      //fetchAndUpdateChartDataForPeriod();
      //console.log('Date filter:', dateFilter)
    });
  }, [dateFilter, currentDayIndex])
);

  useEffect(() => {
    const updateCurrentIndex = () => {
      const newIndex = findCurrentIndex(periods, dateFilter);
      setCurrentDayIndex(newIndex);
      //console.log('Current index:', newIndex)
    };
    //updateCurrentIndex();
    if (isFocused || dateFilter) {
      //fetchAndUpdateChartDataForPeriod();
      updateCurrentIndex();
    }
  }, [isFocused, dateFilter, periods]);

  useEffect(() => {
    const fetchDataForCurrentPeriod = async () => {
      setIsLoading(true);
      // Check if there's a valid swipe index; if not, default to using the current day index
      const indexToUse = currentSwipeIndex !== null ? currentSwipeIndex : currentDayIndex;
      const currentPeriod = periods[indexToUse];
      if (dateFilter == 'day') {
        const dateString = currentPeriod.date.toISO();
        console.log('Fetching data for period string:', dateString);
        setCurrentPeriodSlide(dateString);
      }
      if (currentPeriod) {
        
        await fetchAndUpdateChartDataForPeriod(currentPeriod);
        await fetchTransactionsForPeriod(currentPeriod);
        
      }
      setIsLoading(false);

    };

    if(dateFilter !== 'all') {
      fetchDataForCurrentPeriod();
      setBalanceColor();
    }
    else
    {
      scrollViewRef.current.scrollTo({x: 45, animated:true})
      fetchAndUpdateChartData();
      fetchTransactionsAllTime();
      setBalanceColor();
    }


  }, [currentSwipeIndex, currentDayIndex, periods, balance, modalVisible, currency]);

  useEffect(() => {
    if (dateFilter == 'day') {
      if (income > 0 && expenses > 0) {
        const expensesPercentage = (expenses / income) * 100;
        setSuggestion(`This day you have spent ${expensesPercentage.toFixed(0)}% of your income.`);
      }
      else if (income == 0 && expenses > 0) {
        setSuggestion('This day you have spent all your income.');
      }
      else {
        setSuggestion('You have not spent anything today.');
      }
    } else if (dateFilter == 'week') {
      if (income > 0 && expenses > 0) {
        const expensesPercentage = (expenses / income) * 100;
        setSuggestion(`This week you have spent ${expensesPercentage.toFixed(0)}% of your total income.`);
      }
      else if (income == 0 && expenses > 0) {
        setSuggestion('This week you have spent all your income.');
      }
      else {
        setSuggestion('You have not spent anything this week.');
      }
    } else if (dateFilter == 'month') {
      if (income > 0 && expenses > 0) {
        const expensesPercentage = (expenses / income) * 100;
        const daysUntilEndOfMonth = DateTime.local().endOf('month').diffNow('days').days;
        setSuggestion(`This month you have spent ${expensesPercentage.toFixed(0)}% of your total income and there are ${daysUntilEndOfMonth.toFixed(0)} days left until the end of the month.`);
      }
      else if (income == 0 && expenses > 0) {
        setSuggestion('This month you have spent all your income.');
      }
      else {
        setSuggestion('You have not spent anything this month.');
      }
    } else if (dateFilter == 'year') {
      if (income > 0 && expenses > 0) {
        const expensesPercentage = (expenses / income) * 100;
        setSuggestion(`This year you have spent ${expensesPercentage.toFixed(0)}% of your total income.`);
      }
      else if (income == 0 && expenses > 0) {
        setSuggestion('This year you have spent all your income.');
      }
      else {
        setSuggestion('You have not spent anything this year.');
      }
    } else if (dateFilter == 'all') {
      if (income > 0 && expenses > 0 && income > expenses) {
        const incomePercentage = 100 - (expenses / income) * 100;
        setSuggestion(`You have saved ${incomePercentage.toFixed(0)}% of your all time income.`);
      }
      else if (income > 0 && expenses > 0 && income < expenses) {
        const expensesPercentage = (expenses / income) * 100;
        setSuggestion(`You have spent ${expensesPercentage.toFixed(0)}% of your all time income.`);
      }
      else if (income == 0 && expenses > 0) {
        setSuggestion('You have spent all your income.');
      }
      else {
        setSuggestion('You have not spent anything.');
      }
    }
  }, [expenses, income, dateFilter]);

  const handleToggleCurrency = async () => {
    const success = await toggleCurrency(); // Call the context's toggleCurrency which returns a promise

  if (success) {
    if(dateFilter == 'all') {
      fetchAndUpdateChartData();
      fetchTransactionsAllTime();
    }
    else {
      const indexToUse = currentSwipeIndex !== null ? currentSwipeIndex : currentDayIndex;
      const currentPeriod = periods[indexToUse];
      if (currentPeriod) {
        
        fetchAndUpdateChartDataForPeriod(currentPeriod);
        fetchTransactionsForPeriod(currentPeriod);
        
      }
    }
    }
  };

  const handleDelete = async (transactionId: string, type: string) => {
    const token = await AsyncStorage.getItem('userToken');
    const users = realm.objects<User>('User').filtered(`token == "${token}"`);
    const user = users.length > 0 ? users[0] : null;
  
    if (!user) {
      console.error("User not found");
      return;
    }
  
    try {
      realm.write(() => {
        let transactionToDelete = user.transactions.filtered('id == $0', transactionId)[0];
        if (transactionToDelete && transactionToDelete.isValid()) {
          // First, handle related income or expense categories
          if (type === 'income') {
            user.incomeCategories.forEach(category => {
              let incomesToDelete = category.income.filtered('id == $0', transactionId);
              if (incomesToDelete.length > 0 && incomesToDelete[0].isValid()) {
                realm.delete(incomesToDelete);
                console.log('Income deleted for transaction ID:', transactionId);
              }
            });
          } else if (type === 'expense') {
            user.expensesCategories.forEach(category => {
              let expensesToDelete = category.expenses.filtered('id == $0', transactionId);
              if (expensesToDelete.length > 0 && expensesToDelete[0].isValid()) {
                realm.delete(expensesToDelete);
                console.log('Expense deleted for transaction ID:', transactionId);
              }
            });
          }
  
          // Now delete the transaction itself
          realm.delete(transactionToDelete);
          console.log('Transaction deleted:', transactionId);
        } else {
          throw new Error('Transaction not found or already deleted');
        }

      });

      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: `Removed ${type} successfully`,
        autoClose: 2000,
      });

      // Check if there's a valid swipe index; if not, default to using the current day index
      const indexToUse = currentSwipeIndex !== null ? currentSwipeIndex : currentDayIndex;
      const currentPeriod = periods[indexToUse];
      console.log('Fetching data for period:', currentPeriod);
      if (dateFilter !== 'all')
        fetchTransactionsForPeriod(currentPeriod);
      else
        fetchTransactionsAllTime();
      // Recalculate any dependent state values like total income/expenses
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };
  

  return (
    
    <AlertNotificationRoot>
      <View style={styles.container}>
      <StatusBar  barStyle="dark-content" hidden={false} backgroundColor="#7ac695" />
     <TouchableOpacity style={styles.drawerIcon} onPress={() => openLeftDrawer() }>
          <MaterialCommunityIcons name="calendar-range" size={35} color={'white'}/>
      </TouchableOpacity>

      {currency === 'EUR' ? (
        <TouchableOpacity style={styles.currencyButton} onPress={handleToggleCurrency}>
          <Text style={styles.currencyText}>EUR</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.currencyButton} onPress={handleToggleCurrency}>
          <Text style={styles.currencyText}>RON</Text>
        </TouchableOpacity>
      )}

      {dateFilter !== 'all' && (<TouchableOpacity style={styles.goToCurrentDate} onPress={() => {goToCurrentDateSlide();}}>
        <MaterialCommunityIcons name="update" size={30} color={'white'} />
      </TouchableOpacity>)}
      
      <TouchableOpacity style={styles.menuButton} onPress={() => navigation.toggleDrawer()}>
        <MaterialCommunityIcons name="menu" size={35} color={'white'} />
      </TouchableOpacity>
      
      <View style={styles.topBar}>
      <Text style={styles.dateFilterText}>BudgetBuddy</Text>
      </View>
      
      {dateFilter == 'all' ? (
            <ScrollView
            ref={scrollViewRef} // Assign the ref to the ScrollView
            horizontal={true} // Enable horizontal scrolling
            showsHorizontalScrollIndicator={true} // Optionally show the horizontal scroll indicators
            style={{ width: screenWidth, marginBottom: 30 }} // Set the width to the screen width
          >
              <View style={{ alignItems: 'center', justifyContent: 'center', bottom: modalVisible || statsModalVisible === true ? -65 : 65 }}>
                
                  <DoughnutChart chartData={chartData} 
                              toggleLabel={toggleLabel}
                              visibleLabels={visibleLabels}/>
                  <Text style={[styles.infoTextIncomeAll, {top: modalVisible || statsModalVisible === true ? 230 : 362}]}>{currency == 'EUR' ? `€ ${income.toFixed(2)}` : `RON ${income.toFixed(2)}` } </Text>
                  <Text style={[styles.infoTextExpenseAll, {top: modalVisible || statsModalVisible === true ? 250 : 382}]}> {currency == 'EUR' ? `€ ${expenses.toFixed(2)}` : `RON ${expenses.toFixed(2)}` }</Text>
                  <Text style={[styles.numberExpensesAll, {top: modalVisible || statsModalVisible === true ? 290 : 422}]}> {numberExpenses}</Text>
                  <Text style={[styles.numberExpensesTextAll, {top: modalVisible || statsModalVisible === true ? 310 : 442}]}> Expenses</Text>
                  <View style={{position: 'absolute', alignSelf:'center', bottom: 245, left:40, height: 60, width: 60}}>
                  <TouchableOpacity style={[styles.buttonSuggestions, {top: modalVisible || statsModalVisible === true ? 140 : 5}]} onPress={() => {toggleSuggestions();}}>
                    <Image source={require('../assets/logo2.png')} tintColor={'#7ac695'} resizeMode='stretch' style={{ width: 100, height: 100, position: 'absolute', alignSelf: 'center' }}/>
                  </TouchableOpacity>
                  </View>
                  {suggestionsVisible && (
                  <View style={[styles.suggestionAllTime, {borderColor: balance >= 0 ? '#7ac695' : '#E04E15', bottom: modalVisible || statsModalVisible === true ? 90 : 225}]}>
                    <Text style={styles.suggestionTextAllTime}>{suggestion}</Text>
                  </View>)}
              </View>
                  <TouchableOpacity style={[styles.buttonBalanceAllTime, {backgroundColor: balancePositive ? '#036D19': '#C3423F', bottom: modalVisible || statsModalVisible === true ? -220 : 220}]} onPress={() => {toggleBalanceModal(); }}>
                    <Text style={[styles.infoTextBalance]}>Balance {balance.toFixed(2)} {currency}</Text>
                  </TouchableOpacity>
            </ScrollView>
      ):
      (
      <View style={{position:'absolute', top: 70}}>
      <Swiper ref={swiperRef} style={styles.wrapper} loop={false} index = {currentDayIndex} renderPagination={renderPagination} onIndexChanged={(index) => handleSwipe(index)} key={currentDayIndex}>
        {renderPeriodSlides()}

      </Swiper>
      </View>
    )}

  {modalVisible && (
    <BalanceOverview
    isVisible={modalVisible}
    onClose={toggleBalanceModal}
    transactions={transactions}
    onDelete={handleDelete}
  />
  )}
    {statsModalVisible && (
    <StatsModal
    isVisible={statsModalVisible}
    onClose={toggleStatsModal}
    transactions={transactions}
  />
  )}

    {/* {modalVisible && (
        <BalancePop transactions={transactions} />
      )} */}
      <View style={[styles.summaryButton, {borderTopColor: balance >= 0 ? '#2C6E49': '#C3423F'}]}>
      <TouchableOpacity style={[styles.buttonStats]} onPress={() => {toggleStatsModal(); }}>
            <Text style={[styles.infoTextBalance]}>Summary</Text>
      </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
         <TouchableOpacity style={styles.leftButton} onPress={() => navigation.navigate('Add Income', { currentPeriod: currentPeriodSlide })}>
         {/* <Text style = {{fontWeight: 'bold', color: 'white'}} >Add Income</Text> */}
         <MaterialCommunityIcons name="plus-circle-outline" size={120} color={'green'} />
       </TouchableOpacity>
       <TouchableOpacity style={styles.rightButton} onPress={() => navigation.navigate('Add Expense', { currentPeriod: currentPeriodSlide }, )}>
         {/* <Text style = {{fontWeight: 'bold', color: 'white'}} >Add Expense</Text> */}
         <MaterialCommunityIcons name="minus-circle-outline" size={120} color={'red'} />
       </TouchableOpacity>

      </View>
      </View>
  </AlertNotificationRoot>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fcf4',
  },
  welcomeUser: {
    marginBottom: 60,
    color: 'black',
    fontSize: 20,
    fontFamily: 'Quicksand',
    fontWeight: '700',
  },
  currencyButton: {
    position: 'absolute',
    top: 55,
    left: 50,
    padding: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'white',
    width: 60,
    height: 35,
    zIndex: 1,
  },
  currencyText: {
    color: 'white',
    fontSize: 16,
    left: 6,
    fontFamily: 'Quicksand-Medium',
  },
  slideChartInfo: {
    position: 'absolute',
    top: 100,
    height: 450,
    alignSelf: 'center',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  menuButton: {
    position: 'absolute',
    alignSelf: 'flex-end',
    left: 375,
    top: 49,
    padding: 10,
    zIndex: 1,
  },
  balanceContainer: {
    
  },
  goToCurrentDate: {
    position: 'absolute',
    top: 56,
    right: 55,
    padding: 5,
    backgroundColor: 'transparent',
    borderRadius: 5,
    zIndex: 1,
    // Add any additional styles for the button
  },
  summaryButton: {
    position: 'absolute',
    bottom: 155,
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%', // Adjust the padding as needed
    paddingTop: 10,
    paddingBottom: 15,
    borderTopWidth: 5,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20, // Adjust the padding as needed
    paddingTop: 10,
    paddingBottom: 15,
    alignItems: 'center',
  },
  leftButton: {
    marginVertical: 10,
    marginHorizontal: 50,
    padding: 1,
    backgroundColor: 'transparent',
    borderRadius: 50,
    alignSelf: 'flex-start',
    borderBottomWidth: 0,
    borderBottomColor: 'green',
    shadowColor: 'green',
    shadowOpacity: 0.32,
    shadowRadius: 3.22,
    shadowOffset: { width: 1, height: 4 },
    elevation: 1,
  },
  rightButton: {
    marginVertical: 10,
    marginHorizontal: 50,
    padding: 1,
    backgroundColor: 'transparent',
    borderRadius: 50,
    alignSelf: 'flex-end',
    borderBottomWidth: 0,
    borderBottomColor: 'red',
    shadowColor: 'red',
    shadowOpacity: 0.32,
    shadowRadius: 3.22,
    shadowOffset: { width: 1, height: 4 },
    elevation: 1,
  },
  buttonBalance: {
    //backgroundColor: '#90EE90', // Light green background similar to the image
    position: 'absolute',
    bottom: -60,
    width: 280,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20, // Assuming the button has rounded corners
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  buttonStats: {
    backgroundColor: '#D68C45', // Light green background similar to the image
    top: 10,
    left: 5,
    paddingVertical: 5,
    paddingHorizontal: 20,
    width: 200,
    borderRadius: 20, // Assuming the button has rounded corners
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  buttonBalanceAllTime: {
    //backgroundColor: '#90EE90', // Light green background similar to the image
    position: 'absolute',
    bottom: 220,
    width: 280,
    left: 120,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20, // Assuming the button has rounded corners
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  wrapper: {
    height: 620,
    justifyContent: 'center',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  text: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    bottom: 480,
    
  },
  currentWeekText: {
    marginTop: 10,
    color: 'yellow',
    fontSize: 16,
  },
  paginationContainer: {
    position: 'absolute',
    top: 20, // Adjust top as necessary
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10, // Add padding to container for the space
    
    // ...your styles for the container
  },
  paginationText1: {
    position: 'absolute',
    color: '#4DAA57', // Example text color
    fontSize: 17,
    //fontWeight: 'bold',
    bottom: 562,
    left: 5,
    fontFamily: 'Quicksand-SemiBold',
  },
  paginationText2: {
    position: 'absolute',
    color: '#4DAA57', // Example text color
    fontSize: 17,
    //fontWeight: 'bold',
    bottom: 562,
    left: 320,
    fontFamily: 'Quicksand-SemiBold',
  },
  buttonNextPrevDate: {
    // If you need any specific styles for the buttons
  },
  buttonSuggestions: {
    postion: 'absolute',
    alignSelf: 'center',
    alignContent: 'center',
    top: 5,
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  suggestionAllTime: {
    position: 'absolute',
    bottom: 225,
    color: 'black',
    borderWidth: 1,
    height: 62,
    width: 332,
    right: 92,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderRadius: 10,
  },
  suggestionTextAllTime: {
    fontSize: 14,
    fontFamily: 'Quicksand-Medium',
    left: 10,
    width: 320,
  },
  suggestion: {
    position: 'absolute',
    bottom: 10,
    color: 'black',
    borderWidth: 1,
    borderColor: '#7ac695',
    height: 62,
    width: 331,
    right: 92,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderRadius: 10,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'Quicksand-Medium',
    left: 10,
    width: 318,
  },
  numberExpenses: {
    position: 'absolute',
    top: 185,
    color: '#1E1E24',
    fontSize: 20,
    fontFamily: 'Quicksand-Bold',
    textAlign: 'center',
  },
  numberExpensesText: {
    position: 'absolute',
    top: 210,
    color: '#1E1E24',
    fontSize: 12,
    fontFamily: 'Quicksand-SemiBold',
    textAlign: 'center',
  },
  numberExpensesAll: {
    position: 'absolute',
    top: 422,
    color: '#1E1E24',
    fontSize: 20,
    fontFamily: 'Quicksand-Bold',
    textAlign: 'center',
  },
  numberExpensesTextAll: {
    position: 'absolute',
    top: 442,
    color: '#1E1E24',
    fontSize: 12,
    fontFamily: 'Quicksand-SemiBold',
    textAlign: 'center',
  },
  infoTextIncome: {
    position: 'absolute',
    bottom: 290,
    color: 'green',
    fontSize: 14,
    //fontWeight: 'bold',
    fontFamily: 'Quicksand-SemiBold',
    padding: 5, // Add some padding for each text
    textAlign: 'center',
  },
  infoTextIncomeAll: {
    position: 'absolute',
    top: 362,
    alignSelf: 'center',
    color: 'green',
    fontSize: 14,
    //fontWeight: 'bold',
    fontFamily: 'Quicksand-SemiBold',
    padding: 5, // Add some padding for each text
    textAlign: 'center',
  },
  infoTextExpense: {
    position: 'absolute',
    bottom: 270,
    color: 'red',
    fontSize: 14,
    //fontWeight: 'bold',
    fontFamily: 'Quicksand-SemiBold',
    padding: 3, // Add some padding for each text
    textAlign: 'center',
  },
  infoTextExpenseAll: {
    position: 'absolute',
    top: 382,
    paddingRight: 10,
    alignSelf: 'center',
    color: 'red',
    fontSize: 14,
    //fontWeight: 'bold',
    fontFamily: 'Quicksand-SemiBold',
    padding: 3, // Add some padding for each text
    textAlign: 'center',
  },
  infoTextBalance: {
    color: 'white',
    bottom: 1,
    fontSize: 18,
    //fontWeight: 'bold',
    fontFamily: 'Quicksand-SemiBold',
    padding: 3, // Add some padding for each text
    textAlign: 'center',
  },
  periodText: {
    position: 'absolute',
    color: '#4DAA57',
    fontSize: 18,
    fontFamily: 'Quicksand-Bold',
    //fontWeight: 'bold',
    marginBottom: 20, // Adjust as needed to position below the chart
    top: -64,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 35, // Padding inside the top bar
    zIndex: 0, // Ensure the top bar is above other elements
    backgroundColor: '#7ac695', // Example background color
    borderBottomWidth: 1, // Example border
    borderBottomColor: '#7ac695', // Example border color
  },
  drawerIcon: {
    position: 'absolute',
    top: 56,
    left: 5,
    zIndex: 5, // Ensure the icon is above other elements
    // Styles for your drawer icon
  },
  dateFilterText: {
    // Styles for your date filter text
    right: 0,
    color: 'white',
    fontSize: 20,
    fontFamily: 'DancingScript-Bold',
    top: 25,
  },
});

export default HomeScreen;
