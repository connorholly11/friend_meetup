import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import App from './App';

describe('Friend Meetup App', () => {
  beforeEach(async () => {
    await act(async () => {
      render(<App />);
    });
  });

  test('renders app title', () => {
    const titleElement = screen.getByText(/Friend Meetup App/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('allows user to input free times', async () => {
    const mondayInput = screen.getByLabelText(/Monday/i);
    await act(async () => {
      fireEvent.change(mondayInput, { target: { value: '18:00' } });
    });
    expect(mondayInput.value).toBe('18:00');
  });

  test('allows user to add preferred activities', async () => {
    const activityInput = screen.getByPlaceholderText(/Enter an activity/i);
    const addButton = screen.getByText(/Add/i);
    await act(async () => {
      fireEvent.change(activityInput, { target: { value: 'Bowling' } });
      fireEvent.click(addButton);
    });
    const addedActivity = await screen.findByText(/Bowling/i);
    expect(addedActivity).toBeInTheDocument();
  });

  test('allows user to set hosting preference', async () => {
    const hostingSelect = screen.getByLabelText(/Willing to Host?/i);
    await act(async () => {
      fireEvent.change(hostingSelect, { target: { value: 'yes' } });
    });
    expect(hostingSelect.value).toBe('yes');
  });

  test('allows user to add friends', async () => {
    const friendInput = screen.getByPlaceholderText(/Enter username to send request/i);
    const addFriendButton = screen.getByText(/Send Request/i);
    await act(async () => {
      fireEvent.change(friendInput, { target: { value: 'JohnDoe' } });
      fireEvent.click(addFriendButton);
    });
    const addedFriend = await screen.findByText(/JohnDoe/i);
    expect(addedFriend).toBeInTheDocument();
  });

  test('allows user to create friend groups', async () => {
    const groupNameInput = screen.getByPlaceholderText(/Enter group name/i);
    const createGroupButton = screen.getByText(/Create Group/i);
    await act(async () => {
      fireEvent.change(groupNameInput, { target: { value: 'Movie Night' } });
      fireEvent.click(createGroupButton);
    });
    const createdGroup = await screen.findByText(/Movie Night/i);
    expect(createdGroup).toBeInTheDocument();
  });

  test('displays suggested meetups', async () => {
    // Mock data setup would go here
    // For example:
    // await act(async () => {
    //   // Set up mock friends, groups, free times, etc.
    // });

    // Wait for and check if suggested meetups are displayed
    await waitFor(() => {
      const suggestedMeetups = screen.getByText(/Suggested Meetups/i);
      expect(suggestedMeetups).toBeInTheDocument();
    });
  });
});
