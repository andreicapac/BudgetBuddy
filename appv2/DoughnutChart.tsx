
import React, { useEffect, useState } from 'react';
import { VictoryPie, LineSegment, VictoryLabel, VictoryTooltip, Slice } from 'victory-native';
import { View, Text, ActivityIndicator, StyleSheet, Image, Dimensions } from 'react-native';
import Svg, {Path, Circle, G, Defs } from 'react-native-svg';
import  Filter  from 'react-native-svg'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useCurrency } from './CurrencyContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CurrencyContext } from './CurrencyContext';

export const categoryIcons = {
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

type ChartDataEntry = {
  x: string;  // Category name
  y: number;  // Category value
};

// Type for the entire chart data array
type ChartData = ChartDataEntry[];

// Extend ChartDataEntry to include icon name
type ChartDataWithIcon = ChartDataEntry & {
  iconName: string;
};
// Function to augment chart data with icon names
function augmentChartDataWithIcons(chartData: ChartData): ChartDataWithIcon[] {
  return chartData.map(dataEntry => ({
    ...dataEntry,
    iconName: categoryIcons[dataEntry.x] || 'account-alert', // Provide a default icon if necessary
  }));
}

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
};

const getPolarCoordinates = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

interface Props {
  datum: {
    icon: string;
  };
  slice: {
    centroid: [number, number];
  };
}

interface SliceProps {
  startAngle?: number;
  endAngle?: number;
  padAngle?: number;
  data?: any[];
}

interface CustomSliceProps {
  chartData: Array<{
    x: string;  // Label for the slice
    y: number;  // Value of the slice
    icon: string;  // Name of the icon
  }>;
  datum: {
    x: string;  // Label for the slice
    y: number;  // Value of the slice
    icon: string;  // Name of the icon
  };
  index: number;  // Index of the slice
  slice: SliceProps;
  innerRadius?: number;
  radius?: number;
}

class CustomSlice extends React.Component<CustomSliceProps> {
  render() {
    const { datum, slice, innerRadius, radius,  } = this.props;
    const iconName = datum.icon;
    const iconSize = 30;
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height - 400;
    //const center = (Dimensions.get('window').width - 50) / 2; // Assuming the chart is centered in the view
    const chartCenter = Math.min(windowWidth, windowHeight) / 2;
    const radiusCalculated = (innerRadius + radius) / 2;
    const angle = (slice.startAngle + slice.endAngle) / 2;
    
    const centroid = getPolarCoordinates(chartCenter, chartCenter, radiusCalculated, angle * (180 / Math.PI));
    //console.log("centroid: ", centroid.x - iconSize / 2 + 60)

    const iconStyle = {
      position: 'absolute',
      left: centroid.x - iconSize / 2 + 45,
      top: centroid.y - iconSize / 2,
    };
    const styles ={
      boxShadow: "10px 5px 5px red",
    };
    return (
      <G >
        <Slice {...this.props}
         />
        <View style={{ ...iconStyle, position: 'absolute' }}>
        <MaterialCommunityIcons
          name={iconName}
          size={iconSize}
          style={{
            textAlign: 'center',
          }}
          color="white" // Icon color
        />
      <Text style={{color:'white', fontFamily: 'Quicksand-Bold', fontSize: 16}}>{datum.y.toFixed(0)}%</Text>
        <VictoryLabel 
          textAnchor="middle"
          verticalAnchor='middle'
          x={centroid.x - iconSize / 2 + 60}
          y={centroid.y + iconSize / 2 + 10}
          text={datum.y.toFixed(0)+'%'}
          style={{}}
        />
        </View>
      </G>
    );
  }
}

type ToggleLabelFunction = (index: string) => void;
type VisibleLabels = { [index: string]: boolean };

interface DoughnutChartProps {
  chartData: Array<{
    x: string; // Label for the slice
    y: number; // Value of the slice
    label: string; // Label for the slice
    icon: string; // Name of the icon
    currency: string; // Currency symbol
  }>;
  toggleLabel: ToggleLabelFunction; // Add the toggleLabel function to the props
  visibleLabels: VisibleLabels; // Add the visibleLabels state to the props
}

// Accept chartData as a prop
class DoughnutChart extends React.Component<DoughnutChartProps> {
  constructor(props: DoughnutChartProps) {
    super(props);
    // If toggleLabel is passed as a prop and is not an arrow function, bind it here
    //this.props.toggleLabel.bind(this);
  }
  static contextType = CurrencyContext;
  render() {
    const { chartData, toggleLabel, visibleLabels } = this.props;
  // Calculate the dimensions based on the screen size or a fixed value
  const chartWidth = Dimensions.get('window').width + 90;
  const chartHeight = Dimensions.get('window').height-470;
  const { currency } = this.context;

  const innerRadius = 80;
  const shadowOffset = 3; // The offset of the shadow
  const shadowColor = '#474747'; // The color of the shadow

  return (
    <>
    {chartData.length > 0 ? (

    <View style={{ position: 'relative', bottom: 50, width: chartWidth, height: chartHeight }}>
      <View style={{ position: 'absolute', top: shadowOffset-6, left: shadowOffset-6 }}>
            <VictoryPie
              data={[{ x: ' ', y: 1 }]}
              width={chartWidth}
              height={chartHeight}
              innerRadius={innerRadius}
              colorScale={[shadowColor]}
              style={{ data: { fill: shadowColor, opacity: 0.3 } }}
            />
          </View>
    
          {/* Shadow on the other side */}
          <View style={{ position: 'absolute', top: -shadowOffset, left: -shadowOffset }}>
            <VictoryPie
              data={[{ x: ' ', y: 1 }]}
              width={chartWidth}
              height={chartHeight}
              innerRadius={innerRadius}
              colorScale={[shadowColor]}
              style={{ data: { fill: shadowColor, opacity: 0.3 } }}
            />
          </View>

        <VictoryPie
          data={chartData.map((data) => ({
            ...data,
            label: visibleLabels[data.x] ? `${data.x}` : null // This should completely hide the label
          }))
        .sort((a,b) => a.y - b.y)}
          sortKey={'y'}
          sortOrder="ascending"
          labelComponent={
          <VictoryLabel
            text={({ datum }) => visibleLabels[datum.x] ? `${datum.x}\n(${datum.y.toFixed(2)}%)\n${currency} ${datum.amount.toFixed(2)}`: null}
            
          />}
          events={[
            {
              target: 'data',
              eventHandlers: {
                onPressIn: (_, { index }) => {
                  const sortedData = chartData.sort((a, b) => a.y - b.y);
                  const dataKey = sortedData[index].x;
                  toggleLabel(dataKey);
                  return [];
                },
              },
            },
          ]}
          labelPlacement={'vertical'}
          width={chartWidth}
          height={chartHeight}
          key={JSON.stringify(visibleLabels)}
          innerRadius={80} // Adjust if needed
          labelRadius={177} // Adjust if needed
          labelIndicatorInnerOffset={43}
          labelIndicatorOuterOffset={2}
          style={{
            labels: { fill: 'black', fontSize: 14, fontFamily:'Quicksand-SemiBold', lineHeight: 1.5, textTransform: 'capitalize' },
            data: {
              overflow: 'visible',
              //strokeOpacity: 0,
              //strokeWidth: 0,
            },
            parent: { 
              overflow: 'visible',

             },
          }}
          colorScale='qualitative' // Sample color scale
          dataComponent={<CustomSlice />}
        />

    </View>
        ) : (
          <View style={{ position: 'relative', bottom: 50, width: chartWidth, height: chartHeight }}>
          {/* Shadow on one side */}
          <View style={{ position: 'absolute', top: shadowOffset-5, left: shadowOffset-5 }}>
            <VictoryPie
              data={[{ x: ' ', y: 1 }]}
              width={chartWidth}
              height={chartHeight}
              innerRadius={innerRadius}
              colorScale={[shadowColor]}
              style={{ data: { fill: shadowColor, opacity: 0.5 } }}
            />
          </View>
    
          {/* Shadow on the other side */}
          <View style={{ position: 'absolute', top: -shadowOffset, left: -shadowOffset }}>
            <VictoryPie
              data={[{ x: ' ', y: 1 }]}
              width={chartWidth}
              height={chartHeight}
              innerRadius={innerRadius}
              colorScale={[shadowColor]}
              style={{ data: { fill: shadowColor, opacity: 0.5 } }}
            />
          </View>
    
          {/* Main Chart */}
          <View style={{ position: 'absolute' }}>
            <VictoryPie
              data={[{ x: ' ', y: 1 }]}
              width={chartWidth}
              height={chartHeight}
              innerRadius={innerRadius}
              labelRadius={160} // Adjust if needed
              colorScale={['#B2B2B2']}
            />
          </View>
        </View>
        )}
        </>
  );
  }
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "red",
    shadowOffset: {
        width: 2,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 30,
},
  slide: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#9DD6EB',
  height: 400,
  },
});

export default DoughnutChart;
