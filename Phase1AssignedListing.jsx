import React, {useState, useCallback, useEffect, useMemo} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import moment from 'moment';

import Title from '../../../../component/title/Style';
import Style from './Style';
import BOTTOM_LOGO from '../../../../assets/bottom-img.png';
import {getWithHeaders} from '../../../../services/ApiRequest';
import Endpoints from '../../../../services/AllEndPoint';
import {showErrorMessage} from '../../../../untils/FlashMessageUtils';
import Loader from '../../../../component/loader/Loader';
import SmallDatePicker from '../../../../component/smalldatepicker/SmallDatePicker';

// Helper function to restrict the "To Date" range
const adjustToDate = (fromDate, toDate) => {
  const maxToDate = moment(fromDate, 'DD-MM-YYYY').add(7, 'days');
  return moment(toDate, 'DD-MM-YYYY').isAfter(maxToDate)
    ? maxToDate.format('DD-MM-YYYY')
    : toDate;
};

const Phase1AssignedListing = () => {
  const navigation = useNavigation();
  const userId = useSelector(state => state.auth.user.user_id);

  const today = useMemo(() => moment().format('DD-MM-YYYY'), []);

  const [dateRange, setDateRange] = useState({
    fromDate: today,
    toDate: today,
  });

  const [isLoading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);

  // Call API with current date on initial render
  // useEffect(() => {
  //   getAssignedList();
  // }, []);

  useFocusEffect(
    useCallback(() => {
      getAssignedList();
    }, [getAssignedList]),
  );

  // API call function
  const getAssignedList = useCallback(async () => {
    setLoading(true);
    try {
      const {fromDate, toDate} = dateRange;
      const response = await getWithHeaders(
        `${Endpoints.PHASE_ONE_LISTING}?user_id=${userId}&search_date=${fromDate}&to_date=${toDate}`,
      );
      setAssignments(response?.survey_list || []);
    } catch (error) {
      showErrorMessage('Unable to get List');
    } finally {
      setLoading(false);
    }
  }, [userId, dateRange]);

  // Handler for date selection
  const handleDateChange = (key, value) => {
    setDateRange(prevState => ({
      ...prevState,
      [key]:
        key === 'fromDate' ? value : adjustToDate(prevState.fromDate, value),
    }));
  };

  const renderDatePickers = () => (
    <View style={Style.datePickerContainer}>
      <View>
        <SmallDatePicker
          placeholder="dd/mm/yyyy"
          isVisible={true}
          onConfirm={date => handleDateChange('fromDate', date)}
          selectedDate={dateRange.fromDate}
        />
        <Text style={Style.filterText}>From Date</Text>
      </View>
      <View>
        <SmallDatePicker
          placeholder="dd/mm/yyyy"
          isVisible={true}
          onConfirm={date => handleDateChange('toDate', date)}
          selectedDate={dateRange.toDate}
          maximumDate={moment(dateRange.fromDate, 'DD-MM-YYYY')
            .add(7, 'days')
            .toDate()}
        />
        <Text style={Style.filterText}>To Date</Text>
      </View>
    </View>
  );

  // List rendering
  const renderItem = ({item, index}) => (
    <View style={Style.row}>
      <Text style={Style.cell}>{index + 1}</Text>
      <Text style={Style.cell}>{item.state_name}</Text>
      <Text style={Style.cell}>{item.district_name}</Text>
      <Text style={Style.cell}>{item.survey_type}</Text>
      <Text style={Style.cell}>{item.surveyor}</Text>
      <Text style={Style.cell}>{item.survey_date}</Text>
      <Text style={Style.cell}>{item.start_time}</Text>
      <Text style={Style.cell}>{item.end_time}</Text>
    </View>
  );

  return (
    <SafeAreaView style={Style.container}>
      <View style={Style.titleContainer}>
        <Title text="Phase-1 Assigned Listing" />
      </View>

      {renderDatePickers()}

      <View style={Style.btnContainer}>
        <TouchableOpacity
          style={Style.getButton}
          activeOpacity={1}
          onPress={getAssignedList}>
          <Text style={Style.getButtonText}>G E T</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <Loader />
      ) : (
        <ScrollView horizontal style={Style.scrollContainer}>
          <View style={Style.table}>
            <View style={Style.tableHeader}>
              <View style={Style.headerRow}>
                <Text style={Style.headerCell}>S/N</Text>
                <Text style={Style.headerCell}>State</Text>
                <Text style={Style.headerCell}>District</Text>
                <Text style={Style.headerCell}>Type of Survey</Text>
                <Text style={Style.headerCell}>Surveyor</Text>
                <Text style={Style.headerCell}>Date</Text>
                <Text style={Style.headerCell}>From Time</Text>
                <Text style={Style.headerCell}>To Time</Text>
              </View>
            </View>
            <FlatList
              data={assignments}
              keyExtractor={item => item.assigned_id}
              renderItem={renderItem}
              contentContainerStyle={Style.listContentContainer}
              ListEmptyComponent={
                <View style={Style.nosurveyView}>
                  <Text style={Style.nosurvey}>No Survey Assigned</Text>
                </View>
              }
            />
          </View>
        </ScrollView>
      )}

      <View style={Style.bottomimg}>
        <Image source={BOTTOM_LOGO} />
      </View>
    </SafeAreaView>
  );
};

export default Phase1AssignedListing;
