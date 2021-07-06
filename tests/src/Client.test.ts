import WebSocket from 'ws';
import Client, { ClientOpts } from '../../src/Client';
import Command from '../../src/Command';
import * as Discord from '../../src/Discord';

/**
 * Finds the Nth time a mock function was called with a specific argument.
 *
 * @remarks
 * The index begins counting from zero.
 *
 * @param mockCalls - The output of `mockFn.mock.calls`, a two-dimensional array
 * @param arg - Argument to find in `mockCalls`
 * @returns The index of where `arg` is in `mockCalls`
 *
 * @example
 * ```ts
 * const mockCalls = [['open', ...], ['message', ...], ['close', ...]]
 * findCallIndexByArg(mockCalls, 'open')  // returns 0
 * findCallIndexByArg(mockCalls, 'message')  // returns 1
 * findCallIndexByArg(mockCalls, 'close')  // returns 2
 * ```
 *
 * @see {@link https://jestjs.io/docs/mock-function-api#mockfnmockcalls }
 */
function findCallIndexByArg(mockCalls: any[][], arg: any): number {
  return mockCalls.findIndex(arr => {
    return arr[0] == arg;
  });
}

/**
 * Gets the callback function used alongside the `arg` in a `method`.
 *
 * @remarks
 * Used for when a single method is called multiple times with different
 * arguments.
 *
 * @param obj - Object
 * @param method - Method name of `obj`
 * @param arg - Argument used in `method`
 * @returns Callback function used alongside the `arg` in the `method`
 */
function getCallbackArg(obj: any, method: string, arg: any): any {
  const methodSpy = jest.spyOn(obj, method);
  const callIndex = findCallIndexByArg(methodSpy.mock.calls, arg);
  // Callback always in second argument in WebSocket.on()
  return methodSpy.mock.calls[callIndex][1];
}

jest.mock('../../src/Command');
jest.mock('ws');

const MockWebSocket = WebSocket as jest.MockedClass<typeof WebSocket>;

describe('Client.handleCommands()', () => {
  const ClientOpts = {
    intents: [jest.fn() as unknown as Discord.Intent] as Discord.Intent[],
  } as unknown as ClientOpts;

  const client = new Client(ClientOpts);

  it('handles 0 commands', () => {
    const mockCommands: Command[] = [];

    const actual: Record<string, Command> = {};

    client.handleCommands(mockCommands);
    expect(client['_commands']).toStrictEqual(actual);
  });

  it('handles 1 command', () => {
    const mockCommands: Command[] = [{ name: 'cat' } as unknown as Command];

    const actual: Record<string, Command> = {
      cat: { name: 'cat' } as unknown as Command,
    };

    client.handleCommands(mockCommands);
    expect(client['_commands']).toStrictEqual(actual);
  });

  it('handles 3 commands', () => {
    const mockCommands: Command[] = [
      { name: 'elephant' } as unknown as Command,
      { name: 'pig' } as unknown as Command,
      { name: 'donkey' } as unknown as Command,
    ];

    const actual: Record<string, Command> = {
      elephant: { name: 'elephant' } as unknown as Command,
      pig: { name: 'pig' } as unknown as Command,
      donkey: { name: 'donkey' } as unknown as Command,
    };

    client.handleCommands(mockCommands);
    expect(client['_commands']).toStrictEqual(actual);
  });
});

describe('Client.connect() with promise resolved', () => {
  let client: Client;
  let connection: Promise<Discord.ReadyPayload>;
  let ready: Discord.ReadyPayload;

  beforeEach(() => {
    // Instantiate client with mocked properties
    const ClientOpts = {
      intents: [jest.fn() as unknown as Discord.Intent] as Discord.Intent[],
    } as unknown as ClientOpts;
    client = new Client(ClientOpts);

    // Mock successful connection
    connection = client.connect();
    ready = jest.fn() as unknown as Discord.ReadyPayload;
    if (client['_connectCallback']) {
      client['_connectCallback'](ready); // assume resolved
    }
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('Just started and Discord dispatches ready event', () => {
    return connection.then(data => {
      expect(client['_ws']).toBeDefined();
      if (client['_ws']) {
        expect(client['_ws'].on).toHaveBeenCalledTimes(4);

        // on close should be after on open
        const onMethodSpy = jest.spyOn(client['_ws'], 'on');
        const openIndex = findCallIndexByArg(onMethodSpy.mock.calls, 'open');
        const closeIndex = findCallIndexByArg(onMethodSpy.mock.calls, 'close');
        expect(closeIndex > openIndex).toBeTruthy();
      }
      expect(MockWebSocket).toHaveBeenCalledTimes(1);
      expect(data).toBe(ready);
    });
  });

  it('Just started and Discord fails to dispatch ready event', () => {
    // TODO
    // I am not entirely sure what happens if Discord fails to dispatch ready
    // event.
  });

  test('Websocket brings a message after successful initial connection', () => {
    return connection.then(data => {
      expect(client['_ws']).toBeDefined();
      if (client['_ws']) {
        const mockHandleMessage = jest.spyOn(client, '_handleMessage' as never);
        const mockRawMessage = jest.fn() as unknown as WebSocket.Data;

        const jsonParseSpy = jest
          .spyOn(JSON, 'parse')
          .mockImplementation(raw => {
            return raw as unknown as Discord.GatewayMessage;
          });

        const messageCallBack = getCallbackArg(client['_ws'], 'on', 'message');
        messageCallBack(mockRawMessage);

        expect(jsonParseSpy).toHaveBeenCalledWith(String(mockRawMessage));
        expect(mockHandleMessage).toHaveBeenCalledWith(
          JSON.parse(
            String(mockRawMessage),
          ) as unknown as Discord.GatewayMessage,
        );
      }
      expect(data).toBe(ready);
    });
  });

  test('Websocket closing and Client reconnecting', () => {
    return connection.then(data => {
      expect(client['_ws']).toBeDefined();
      if (client['_ws']) {
        jest.useFakeTimers();

        const logSpy = jest.spyOn(console, 'log');
        const connectSpy = jest.spyOn(client, 'connect');

        const closeCallBack = getCallbackArg(client['_ws'], 'on', 'close');
        closeCallBack(20, 'Reason for error');

        jest.runAllTimers();

        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(connectSpy).toHaveBeenCalledTimes(1);
      }
      expect(data).toBe(ready);
    });
  });

  test('Websocket running into error after promise resolved', () => {
    return connection.then(data => {
      expect(client['_ws']).toBeDefined();
      if (client['_ws']) {
        const mockErrorMessage = 'Error message' as unknown as Error;
        const errorSpy = jest.spyOn(console, 'error');

        const errCallBack = getCallbackArg(client['_ws'], 'on', 'error');
        errCallBack(mockErrorMessage);

        expect(errorSpy).toHaveBeenCalledWith(mockErrorMessage);
      }
      expect(data).toBe(ready);
    });
  });
});
