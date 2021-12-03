import { allow, and, deny, not, or, shield } from 'graphql-shield';
import * as rules from '../permissions/rules';
import { Role } from '../datamodel/db-schema';
import { OR, rbac } from './inheritance';

const { isCaller, Reference } = rules;
const invitedOrManager = or(
    rules.callerIsInvitedToParent,
    rules.callerManagesParent,
);
const publicOrInvitedOrAttending = or(
    not(rules.parentIsPrivate),
    rules.callerIsInvitedToParent,
    rules.callerAttendsParent,
);

const attendantUnlessLocked = and(
    rules.callerAttendsParent,
    or(not(rules.parentIsLocked), rules.callerManagesParent),
);
/**
 * Permissions for not being logged in.
 */
// TODO: Implement!
const DEFAULTS = {
    Category: {
        _id: allow,
        name: allow,
        events: allow,
    },
    Query: {
        events: allow,
    },
    Mutation: {
        createUser: allow,
        login: allow,
    }
};

/**
 * Unique permissions of free users.
 */
// TODO: Implement!
const FREE = {  
    User: {
        _id: allow,
        name: rules.isLoggedIn,
        surname: rules.isLoggedIn,
        username: rules.isLoggedIn,
        role: rules.isLoggedIn,
        moderates: rules.isLoggedIn,
        attends: isCaller(Reference.PARENT),
        requests: isCaller(Reference.PARENT),
        authored: isCaller(Reference.PARENT),
        subscribes: isCaller(Reference.PARENT),
        invitations: isCaller(Reference.PARENT),
        invites: isCaller(Reference.PARENT),
    },
    Category: {
        _id: allow,
        name: allow,
        events: allow,
        moderators: rules.isLoggedIn,
    },
    Invitation: {
        _id: invitedOrManager,
        from: invitedOrManager,
        invited: invitedOrManager,
        to: invitedOrManager,
    },
    Event: {
        _id: publicOrInvitedOrAttending,
        title: publicOrInvitedOrAttending,
        time: publicOrInvitedOrAttending,
        description: publicOrInvitedOrAttending,
        location: publicOrInvitedOrAttending,
        owner: publicOrInvitedOrAttending,
        private: publicOrInvitedOrAttending,
        attendants: publicOrInvitedOrAttending,
        managers: publicOrInvitedOrAttending,
        requests: rules.callerManagesParent,
        invited: rules.callerManagesParent,
        messageBoard: or(
            rules.callerAttendsParent,
        ),
    },
    Post: {
        _id: attendantUnlessLocked,
        content: attendantUnlessLocked,
        author: attendantUnlessLocked,
        postedAt: attendantUnlessLocked,
        flagged: rules.callerManagesParent,
        locked: rules.callerManagesParent,
    },
    Query: {
        users: rules.isLoggedIn,
        usersByUsername: rules.isLoggedIn,
    },
    Mutation: {
        // Users
        editUser: isCaller(Reference.ARG),
        unsubscribe: allow,
        // Events
        createEvent: and(
            rules.isLoggedIn,
            not(rules.argIsPrivate),
        ),
        editEvent: and(
            or(
                rules.callerManagesArg,
                rules.callerOwnsArg
            ),
            not(rules.argIsPrivate),
        ),
        addCategories: rules.callerManagesArg,
        removeCategories: rules.callerManagesArg,
        deleteEvent: rules.callerOwnsParent,

        // Event management
        // addAttendant: or(
        //     and(rules.callerManagesArg, rules.argRequestsArg),
        //     and(isCaller(Reference.ARG), rules.callerIsInvitedToArg),
        // ),
        kick: and(
            not(and(rules.callerOwnsArg, isCaller(Reference.ARG))),
            or(isCaller(Reference.ARG), rules.callerManagesArg),
        ),
        promote: rules.callerOwnsArg,
        demote: and(rules.callerOwnsArg, not(isCaller(Reference.ARG))),

        // Invitations
        invite: and(
            rules.isLoggedIn,
            or(
                rules.callerManagesArg,
                rules.callerOwnsArg,
            ),
        ),
        //createInvitation: rules.isLoggedIn,
        // TODO: In its current implementation, checking this permission is
        // very hard to implement - do it better!
        //editInvitation: allow,
        acceptInvitation: rules.callerIsInvitedToArg,
        declineInvitation: or(
            rules.callerIsInvitedToArg,
            rules.callerManagesArg,
            rules.callerOwnsArg,
        ),

        // Requests
        request: not(rules.argIsPrivate),
        acceptRequest: or(
            rules.callerOwnsArg,
            rules.callerManagesArg
        ),
        declineRequest: or(
            rules.callerRequestsArg,
            rules.callerManagesArg,
            rules.callerOwnsArg,
        ),

        // Posts
        // createPost: rules.isLoggedIn,
        createPost: and(
            rules.isLoggedIn,
            rules.callerAttendsArg
        ),
        // TODO: In its current implementation, checking this permission is
        // very hard to implement - do it better!
        flagPost: rules.callerAttendsArg,
        review: and(
            rules.argIsFlagged,
            rules.callerManagesArg,
        ),
    },
};

/**
 * Unique permissions of premium users.
 */
// TODO: Implement!
const PREMIUM = {
    Mutation: {
        subscribe: allow,
        createEvent: allow,
        editEvent: or(
            rules.callerManagesArg,
            rules.callerOwnsArg
        ),
    }
};

/**
 * Unique permissions of moderators.
 */
// TODO: Implement!
const MODERATOR = {
    Category: {
        subscribers: rules.callerModeratesParent
    },
    Event: {
        messageBoard:  rules.callerModeratesParent
    },
    Post: {
        _id: rules.callerModeratesParent,
        content: rules.callerModeratesParent,
        author: rules.callerModeratesParent,
        postedAt: rules.callerModeratesParent,
        flagged: rules.callerModeratesParent,
        locked: rules.callerModeratesParent,
    },
    Mutation: {
        removeCategories: rules.callerModeratesArg,
        flagPost: rules.callerModeratesArg,
        review: and(
            rules.argIsFlagged,
            rules.callerModeratesArg,
        )
    }
};

/**
 * Unique permissions of administrators.
 */
// TODO: Implement!
const ADMINISTRATOR = {
    Category: {
        subscribers: allow
    },
    Post: { //COMMENT we should aslo check if we should give access to other objects
        _id: allow,
        content: allow,
        author: allow,
        postedAt: allow,
        flagged: allow,
        locked: allow,
    },
    Mutation: {
        createUser: allow, //COMMENT admin has to be able to create user according to test
        createCategory: allow,
        editCategory: allow,
        deleteCategory: allow,
        assignModerator: allow,
        removeModerator: allow,
        setRole: allow,
        deleteUser: allow,
        removeCategories: allow,
        deletePost: rules.argIsLocked,
        flagPost: allow,
        review: rules.argIsFlagged,
        unlockPost: allow,
    },
};

export const permissions = shield(
    rbac({
        [Role.FREE]: FREE,
        [Role.PREMIUM]: OR(FREE, PREMIUM),
        [Role.MODERATOR]: OR(FREE, PREMIUM, MODERATOR),
        [Role.ADMINISTRATOR]: OR(FREE, PREMIUM, MODERATOR, ADMINISTRATOR),
    }, DEFAULTS),
    {
        fallbackRule: deny,
        debug: true,
    },
);
