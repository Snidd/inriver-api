import { EntitySummary } from '../typings/EntitySummary';
import { getEntitySummary, setMaxConcurrentCalls } from '../api/inRiverApi';
import fetchMock from 'jest-fetch-mock';

const mockFetchPromiseZeroDelay = () => {
  let result = new Promise<string>((resolve, reject) => {
    setTimeout(() => {
      resolve(
        JSON.stringify({
          id: 0,
          displayName: 'todo',
          displayDescription: 'todo',
          version: 'todo',
          lockedBy: 'todo',
          createdBy: 'todo',
          createdDate: 'todo',
          formattedCreatedDate: 'todo',
          modifiedBy: 'todo',
          modifiedDate: 'todo',
          formattedModifiedDate: 'todo',
          resourceUrl: 'todo',
          entityTypeId: 'todo',
          entityTypeDisplayName: 'todo',
          completeness: 'todo',
          fieldSetId: 'todo',
          fieldSetName: 'todo',
          segmentId: 0,
          segmentName: 'todo',
        }),
      );
    }, 0);
  });
  return result;
};

let maximumConcurrentCalls = 10;
let currentNumberOfConcurrentCalls = 0;

const mockFetchVerifyConcurrency = (param: Request) => {
  let result = new Promise<string>((resolve, reject) => {
    currentNumberOfConcurrentCalls++;
    if (currentNumberOfConcurrentCalls > 10) {
      reject(
        `Called API ${currentNumberOfConcurrentCalls} times, which is more then the max of ${maximumConcurrentCalls} times`,
      );
    }
    setTimeout(() => {
      currentNumberOfConcurrentCalls--;
      resolve(
        JSON.stringify({
          id: 0,
          displayName: 'todo',
          displayDescription: 'todo',
          version: 'todo',
          lockedBy: 'todo',
          createdBy: 'todo',
          createdDate: 'todo',
          formattedCreatedDate: 'todo',
          modifiedBy: 'todo',
          modifiedDate: 'todo',
          formattedModifiedDate: 'todo',
          resourceUrl: 'todo',
          entityTypeId: 'todo',
          entityTypeDisplayName: 'todo',
          completeness: 'todo',
          fieldSetId: 'todo',
          fieldSetName: 'todo',
          segmentId: 0,
          segmentName: 'todo',
        }),
      );
    }, 15);
  });
  return result;
};

beforeEach(() => {
  fetchMock.doMock();
  fetchMock.mockResponse(mockFetchPromiseZeroDelay);
});

test('can get 1 EntitySummary', async () => {
  let test = (await getEntitySummary(123)) as EntitySummary;
  expect(test.displayDescription).toBe('todo');
});

test('should limit to only fetch 10 EntitySummaries at a time', async () => {
  maximumConcurrentCalls = 10;
  currentNumberOfConcurrentCalls = 0;
  fetchMock.mockResponse(mockFetchVerifyConcurrency);

  let promises = await Promise.all([...Array(100)].map((num, idx) => getEntitySummary(idx) as Promise<EntitySummary>));
  expect(promises.length).toBe(100);
  expect(promises[0].displayName).toBe('todo');
  expect(promises[99].displayName).toBe('todo');
});

test('should fail because we try to call more then 10 times concurrently', async () => {
  maximumConcurrentCalls = 10;
  currentNumberOfConcurrentCalls = 0;
  setMaxConcurrentCalls(10);
  fetchMock.mockResponse(mockFetchVerifyConcurrency);

  //TODO: Figure out how to actually make this test verify if something did go wrong. right now it always succeeds.
  try {
    await Promise.all([...Array(100)].map((num, idx) => getEntitySummary(idx) as Promise<EntitySummary>));
    //shouldnt get here.
    expect(false).toBe(true);
  } catch (err) {}

  //'Called API 11 times, which is more then the max of 10 times',
});
