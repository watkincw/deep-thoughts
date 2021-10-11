const { User, Thought } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        // get all users
        users: async () => {
            return User.find()
                .select('-__v -password')
                .populate('friends')
                .populate('thoughts');
        },
        // get a user by username
        user: async (parent, { username }) => {
            return User.findOne({ username })
                .select('-__v -password')
                .populate('friends')
                .populate('thoughts');
        },
        // get all thoughts by username
        thoughts: async (parent, { username }) => {
            const params = username ? { username } : {};
            return Thought.find(params).sort({ createdAt: -1 });
        },
        // get a single thought by (thought)_id
        thought: async (parent, { _id }) => {
            return Thought.findOne({ _id });
        }
    },
    Mutation: {
        // create a new user
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            
            return { token, user };
        },
        // log an existing user in, allowing them to "edit themselves" (update an existing user)
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);
            return { token, user };
        }
    }
};

// exporting... ... ...
module.exports = resolvers;