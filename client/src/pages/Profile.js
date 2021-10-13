import React from 'react';
import { Redirect, useParams } from 'react-router-dom';
import Auth from '../utils/auth';

// components
import ThoughtList from '../components/ThoughtList';
import FriendList from '../components/FriendList';
import ThoughtForm from '../components/ThoughtForm';

import { useQuery, useMutation } from '@apollo/client';

// queries
import { QUERY_USER, QUERY_ME } from '../utils/queries';
// mutations
import { ADD_FRIEND } from '../utils/mutations';

const Profile = () => {
	const { username: userParam } = useParams();
	const [addFriend] = useMutation(ADD_FRIEND);

	const { loading, data } = useQuery(userParam ? QUERY_USER : QUERY_ME, {
		variables: { username: userParam }
	});

	const user = data?.me || data?.user || {};

	// redirect to personal profile page if username is the logged-in user's
	if (Auth.loggedIn() && Auth.getProfile().data.username === userParam) {
		return <Redirect to="/profile" />;
	}
	console.log(Auth);
	// console.log(Auth.getProfile());
	// console.log(Auth.getProfile().data.username); // why is '.data' 'unknown'
	// console.log(Auth.loggedIn());
	console.log(data);
	console.log(Auth.getProfile().data); // why is '.data' 'unknown'
	console.log(userParam);
	
	if (loading) {
		return <div>Loading...</div>;
	}

	if (!user?.username) {
		return (
			<h4>
				You need to be logged in to see this page. Use the navigation links above to signup or log in!
			</h4>
		);
	}

	// on 'Add Friend' button click...
	const handleClick = async () => {
		try {
		  	await addFriend({
				variables: { id: user._id }
		  	});
		} catch (e) {
		  	console.error(e);
		}
	};

	return (
		<div>
			<div className="flex-row mb-3">
				<h2 className="bg-dark text-secondary p-3 display-inline-block">
					Viewing { userParam ? `${user.username}'s` : 'your' } profile.
				</h2>
				{ userParam && (
					<button className="btn ml-auto" onClick={ handleClick }>
						Add Friend
					</button>
				) }
			</div>

			<div className="flex-row justify-space-between mb-3">
				<div className="col-12 mb-3 col-lg-8">
					<ThoughtList thoughts={ user.thoughts } title={ `${user.username}'s thoughts...` } />
				</div>

				<div className="col-12 col-lg-3 mb-3">
					<FriendList
						username={ user.username }
						friendCount={ user.friendCount }
						friends={ user.friends }
					/>
				</div>
			</div>

			<div className="mb-3">{ !userParam && <ThoughtForm /> }</div>
		</div>
	);
};

export default Profile;
