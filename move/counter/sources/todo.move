module counter::todo {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use std::string::{Self, String};

    public struct Todo has key {
        id: UID,
        owner: address,
        text: String,
        done: bool,
    }

    // Create a new Todo and transfer it to the sender so it's owned by them
    public entry fun create_todo(text: String, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        transfer::transfer(Todo {
            id: object::new(ctx),
            owner: sender,
            text,
            done: false,
        }, sender)
    }

    public entry fun toggle_done(todo: &mut Todo, ctx: &TxContext) {
        assert!(todo.owner == tx_context::sender(ctx), 0);
        todo.done = !todo.done;
    }

    public entry fun update_text(todo: &mut Todo, new_text: String, ctx: &TxContext) {
        assert!(todo.owner == tx_context::sender(ctx), 0);
        todo.text = new_text;
    }

    public entry fun delete_todo(todo: Todo, ctx: &TxContext) {
        assert!(todo.owner == tx_context::sender(ctx), 0);
        let Todo { id, owner: _, text: _, done: _ } = todo;
        object::delete(id);
    }

    // Getters (optional helpers)
    public fun id(todo: &Todo): &UID { &todo.id }
    public fun owner(todo: &Todo): address { todo.owner }
    public fun text(todo: &Todo): &String { &todo.text }
    public fun done(todo: &Todo): bool { todo.done }
}


