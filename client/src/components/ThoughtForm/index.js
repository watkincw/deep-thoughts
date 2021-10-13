import React, { useState } from "react";
// import quieries and mutations, if necessary
import { useMutation } from "@apollo/client";
// mutations
import { ADD_THOUGHT } from "../../utils/mutations";
// queries
import { QUERY_THOUGHTS, QUERY_ME } from "../../utils/queries";



const ThoughtForm = () => {
    const [thoughtText, setText] = useState('');
    const [characterCount, setCharacterCount] = useState(0);

    // THE NEXT LINE CLEARS ERRORS IN CONSOLE FOR ASSIGNED, BUT UN-USED VARIABLES. If `{ error }` is never used thoughtout the file, you can leave it there and just add that line to let react ignore the declaration of it
    // eslint-disable-next-line
    const [addThought, { error }] = useMutation(ADD_THOUGHT, {
        update(cache, { data: { addThought } }) {
            // could potentiall not exist yet, so wrap in a try...catch
            try {
                // read what's currently in the cache
                const { thoughts } = cache.readQuery({ query: QUERY_THOUGHTS });
                // prepend the newest thought to the front of the array
                cache.writeQuery({
                    query: QUERY_THOUGHTS,
                    data: { thoughts: [addThought, ...thoughts] }
                });
            } catch (e) {
                console.error(e);
            }

            // update me object's cache, appending new thought to the end of the array
            const { me } = cache.readQuery({ query: QUERY_ME });
            cache.writeQuery({
                query: QUERY_ME,
                data: { me: { ...me, thoughts: [...me.thoughts, addThought] } }
            });
        }
    });

    const handleChange = event => {
        if (event.target.value.length <= 280) {
            setText(event.target.value);
            setCharacterCount(event.target.value.length);
        }
    };

    const handleFormSubmit = async event => {
        event.preventDefault();

        try {
            // add thought to database
            await addThought({
                variables: { thoughtText }
            });

            // clear form value
            setText('');
            setCharacterCount(0);
        } catch (e) {
            console.error(e);
        }
    };


    return (
        <div>
            <p className={ `m-0 ${characterCount === 280 ? 'text-error' : ''}` }>
                Character Count: { characterCount }/280
                { error && <span className="ml-2"> Something went wrong...</span> }
            </p>
            <form
                className="flex-row justify-center justify-space-between-md align-stretch"
                onSubmit={ handleFormSubmit }
            >
                <textarea
                    placeholder="Here's a new thought..."
                    value={ thoughtText }
                    className="form-input col-12 col-md-9"
                    onChange={ handleChange }
                ></textarea>
                <button className="btn col-12 col-md-3" type="submit">
                    Submit
                </button>
            </form>
        </div>
    );
};

export default ThoughtForm;