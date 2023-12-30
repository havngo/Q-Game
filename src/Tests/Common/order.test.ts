import { Order } from "../../Common/order";
import { PlayerState } from "../../Common/player-state";

describe("tests for order", () => {
    test("correctly creates an order", () => {
        const ids = ["1", "2", "3", "4", "5"];
        const playerStates = ids.map((id) => new PlayerState(id));
        const order = new Order(playerStates);
        expect(order.isNewRound()).toBeTruthy();
        expect(() => order.currentItem).toThrow(Error);
        expect(order.size).toBe(5);
        expect(order.toArrayFromHead()).toEqual(playerStates);
        order.advance();
        expect(order.toArrayFromHead()).toEqual(playerStates);
        playerStates.forEach((playerState) => {
            expect(order.currentItem).toBe(playerState);
            order.advance();
        });
        expect(order.isNewRound()).toBeTruthy();
        order.advance();
        expect(order.isNewRound()).toBeFalsy();
    });

    test("correctly removes items from an order", () => {
        const ids = ["1", "2", "3", "4", "5"];
        const playerStates = ids.map((id) => new PlayerState(id));
        const order = new Order(playerStates);
        order.removeItem("3");
        expect(order.size).toBe(4);
        const expected = [...playerStates];
        expected.splice(2, 1);
        expect(order.toArrayFromHead()).toEqual(expected);
        expect(() => order.removeItem("3")).toThrow(Error);
        expect(() => order.removeItem("6")).toThrow(Error);
        order.removeItem("1");
        expect(order.size).toBe(3);
        order.advance();
        expect(order.currentItem).toEqual(playerStates[1]);
        order.advance();
        order.removeItem("2");
        expect(order.currentItem).toEqual(playerStates[3]);
        order.removeItem("4");
        order.removeItem("5");
        expect(order.size).toBe(0);
        expect(() => order.currentItem).toThrow(Error);
    });
});
