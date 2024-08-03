import React, { useState } from 'react';
import {
  ChakraProvider,
  Box,
  Text,
  VStack,
  Grid,
  theme,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Select,
  HStack,
  List,
  ListItem,
} from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';

function App() {
  const [freeTimes, setFreeTimes] = useState({});
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState('');
  const [username, setUsername] = useState('');
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendGroups, setFriendGroups] = useState([]);
  const [newFriendRequest, setNewFriendRequest] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [willingToHost, setWillingToHost] = useState('');

  const handleFreeTimeChange = (day, time) => {
    setFreeTimes(prev => ({ ...prev, [day]: time }));
  };

  const handleAddActivity = () => {
    if (newActivity.trim() !== '') {
      setActivities(prev => [...prev, newActivity.trim()]);
      setNewActivity('');
    }
  };

  const handleSendFriendRequest = () => {
    if (newFriendRequest.trim() !== '') {
      setFriendRequests(prev => [...prev, newFriendRequest.trim()]);
      setNewFriendRequest('');
    }
  };

  const handleAcceptFriendRequest = (request) => {
    setFriends(prev => [...prev, request]);
    setFriendRequests(prev => prev.filter(req => req !== request));
  };

  const handleDenyFriendRequest = (request) => {
    setFriendRequests(prev => prev.filter(req => req !== request));
  };

  const handleCreateGroup = () => {
    if (newGroup.trim() !== '') {
      setFriendGroups(prev => [...prev, { name: newGroup.trim(), members: [] }]);
      setNewGroup('');
    }
  };

  const handleAddFriendToGroup = (groupIndex, friend) => {
    setFriendGroups(prev => {
      const newGroups = [...prev];
      newGroups[groupIndex].members.push(friend);
      return newGroups;
    });
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={3}>
          <ColorModeSwitcher justifySelf="flex-end" />
          <VStack spacing={8}>
            <Heading as="h1" size="2xl">Friend Meetup App</Heading>
            <Tabs isFitted variant="enclosed">
              <TabList mb="1em">
                <Tab>Profile</Tab>
                <Tab>Friends</Tab>
                <Tab>Groups</Tab>
                <Tab>Meetups</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Username</FormLabel>
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                      />
                    </FormControl>
                    <Heading as="h2" size="lg">Free Times</Heading>
                    {days.map(day => (
                      <FormControl key={day}>
                        <FormLabel>{day}</FormLabel>
                        <Input
                          type="time"
                          value={freeTimes[day] || ''}
                          onChange={(e) => handleFreeTimeChange(day, e.target.value)}
                        />
                      </FormControl>
                    ))}
                    <Heading as="h2" size="lg" mt={4}>Preferred Activities</Heading>
                    <HStack>
                      <Input
                        value={newActivity}
                        onChange={(e) => setNewActivity(e.target.value)}
                        placeholder="Enter an activity"
                      />
                      <Button onClick={handleAddActivity}>Add</Button>
                    </HStack>
                    <Select placeholder="Select activity">
                      {activities.map((activity, index) => (
                        <option key={index} value={activity}>{activity}</option>
                      ))}
                    </Select>
                    <FormControl>
                      <FormLabel>Willing to Host?</FormLabel>
                      <Select
                        value={willingToHost}
                        onChange={(e) => setWillingToHost(e.target.value)}
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </Select>
                    </FormControl>
                  </VStack>
                </TabPanel>
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Heading as="h2" size="lg">Friends</Heading>
                    <List spacing={3}>
                      {friends.map((friend, index) => (
                        <ListItem key={index}>{friend}</ListItem>
                      ))}
                    </List>
                    <Heading as="h3" size="md">Friend Requests</Heading>
                    <HStack>
                      <Input
                        value={newFriendRequest}
                        onChange={(e) => setNewFriendRequest(e.target.value)}
                        placeholder="Enter username to send request"
                      />
                      <Button onClick={handleSendFriendRequest}>Send Request</Button>
                    </HStack>
                    <List spacing={3}>
                      {friendRequests.map((request, index) => (
                        <ListItem key={index}>
                          {request}
                          <Button size="sm" ml={2} onClick={() => handleAcceptFriendRequest(request)}>Accept</Button>
                          <Button size="sm" ml={2} onClick={() => handleDenyFriendRequest(request)}>Deny</Button>
                        </ListItem>
                      ))}
                    </List>
                  </VStack>
                </TabPanel>
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Heading as="h2" size="lg">Friend Groups</Heading>
                    <HStack>
                      <Input
                        value={newGroup}
                        onChange={(e) => setNewGroup(e.target.value)}
                        placeholder="Enter group name"
                      />
                      <Button onClick={handleCreateGroup}>Create Group</Button>
                    </HStack>
                    {friendGroups.map((group, groupIndex) => (
                      <Box key={groupIndex} borderWidth="1px" borderRadius="lg" p={4}>
                        <Heading as="h3" size="md">{group.name}</Heading>
                        <List spacing={2}>
                          {group.members.map((member, memberIndex) => (
                            <ListItem key={memberIndex}>{member}</ListItem>
                          ))}
                        </List>
                        <Select
                          placeholder="Add friend to group"
                          onChange={(e) => handleAddFriendToGroup(groupIndex, e.target.value)}
                        >
                          {friends.filter(friend => !group.members.includes(friend)).map((friend, index) => (
                            <option key={index} value={friend}>{friend}</option>
                          ))}
                        </Select>
                      </Box>
                    ))}
                  </VStack>
                </TabPanel>
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Heading as="h2" size="lg">Suggested Meetups</Heading>
                    <Text>Meetup suggestions will be displayed here based on friends' availability and preferences.</Text>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </Grid>
      </Box>
    </ChakraProvider>
  );
}

export default App;
