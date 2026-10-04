import { HistoryItem, PresetLogicExample } from '../types';

const HISTORY_KEY = 'logic2code_history';
const THEME_KEY = 'logic2code_theme';

export const PRESET_EXAMPLES: PresetLogicExample[] = [
  {
    title: 'Find Maximum in Array',
    description: 'Classic linear scan comparing each element with the running maximum.',
    problem: 'Find the largest number in an integer array.',
    logic:
      'First take the first element as the maximum. Then iterate through the rest of the array. For each element, compare it with the current maximum. If the element is greater, update maximum. Return the maximum element at the end.',
    language: 'python',
    difficulty: 'Beginner',
  },
  {
    title: 'Two Sum via Hash Map',
    description: 'Find two indices whose values add up to a specific target in O(N) time.',
    problem: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    logic:
      'Create an empty dictionary/hash map to store numbers and their indices. For each index and number in nums: calculate the needed complement = target - number. If the complement is already in the map, return the pair of indices [map[complement], index]. Otherwise, insert the current number and index into the map. If no pair is found, return empty list.',
    language: 'javascript',
    difficulty: 'Intermediate',
  },
  {
    title: 'Binary Search in Sorted Array',
    description: 'Logarithmic search dividing the search space in half each iteration.',
    problem: 'Search for a target value in a strictly ascending sorted array.',
    logic:
      'Set low pointer to 0 and high pointer to length minus 1. While low is less than or equal to high: calculate mid = low + (high - low) / 2. If array[mid] equals target, return mid. If array[mid] is less than target, target must be in the right half, so set low = mid + 1. Otherwise target is in the left half, so set high = mid - 1. If loop terminates without match, return -1.',
    language: 'cpp',
    difficulty: 'Beginner',
  },
  {
    title: 'Reverse a Singly Linked List',
    description: 'Iterative three-pointer reversal of node pointers.',
    problem: 'Reverse a singly-linked list in place and return its new head.',
    logic:
      'Initialize three pointers: prev pointer pointing to NULL, curr pointer pointing to head, and next pointer as NULL. While curr is not NULL: store curr.next in next to avoid losing the rest of the list. Reverse the link by setting curr.next = prev. Move prev forward to curr. Move curr forward to next. Finally, return prev which will now be the new head of the reversed list.',
    language: 'java',
    difficulty: 'Intermediate',
  },
  {
    title: 'Valid Parentheses using Stack',
    description: 'Verify balanced brackets and closing order using LIFO stack.',
    problem: 'Determine if an input string of brackets "()[]{}" is valid and properly matched.',
    logic:
      'Initialize an empty stack. For each character in the string: if it is an opening bracket "(", "[", or "{", push it onto the stack. If it is a closing bracket, check if the stack is empty; if empty, return false. Pop the top element from the stack and verify that it matches the corresponding closing bracket. If it does not match, return false. After checking all characters, return true if the stack is empty, otherwise false.',
    language: 'python',
    difficulty: 'Beginner',
  },
  {
    title: 'Count Frequency of Elements',
    description: 'Tabulate occurrences of each item in a collection.',
    problem: 'Count how many times each character or element occurs.',
    logic:
      'Initialize a hash table or dictionary of counts. Iterate through every element in the collection. If the element exists in the count map, increment its count by 1. Otherwise, insert it with count 1. Return the map of frequencies.',
    language: 'c',
    difficulty: 'Beginner',
  },
];

export function getHistory(): HistoryItem[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item === 'object' && item.id && item.type);
  } catch (e) {
    console.error('Failed to load history from localStorage', e);
    return [];
  }
}

export interface SaveHistoryItemResult extends HistoryItem {
  persistenceSucceeded: boolean;
}

export function saveHistoryItem(item: Omit<HistoryItem, 'id' | 'createdAt'>): SaveHistoryItemResult {
  const history = getHistory();
  const newItem: HistoryItem = {
    ...item,
    id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: Date.now(),
  };

  const updated = [newItem, ...history].slice(0, 50); // keep last 50 items
  let persistenceSucceeded = true;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    persistenceSucceeded = false;
    console.error('Failed to persist history item', e);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('logic2code:storage_error', {
          detail: 'The current session is still available, but it could not be saved to local history.',
        })
      );
    }
  }
  return {
    ...newItem,
    persistenceSucceeded,
  };
}

export function deleteHistoryItem(id: string): void {
  const history = getHistory();
  const filtered = history.filter((item) => item.id !== id);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete history item', e);
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error('Failed to clear history', e);
  }
}

export function getStoredTheme(): 'dark' | 'light' {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    return theme === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function setStoredTheme(theme: 'dark' | 'light'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error('Failed to save theme', e);
  }
}
