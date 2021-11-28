import { any } from 'expect';
import { and, IRules, or, rule } from 'graphql-shield';
import { LogicRule, Rule, RuleAnd, RuleOr } from 'graphql-shield/dist/rules';
import { ILogicRule, ShieldRule } from 'graphql-shield/dist/types';
import { isArray, mapValues, reduce, values } from 'lodash';
import { Role } from '../datamodel/db-schema';
import { callerHasRole } from '../permissions/rules';
import { project } from '../permissions/util';
import { getLoggedIn } from '../resolvers/util';
import { mapLeafs, mergeArrayMap, RecMap } from './util';

/**
 * Type-checks `ShieldRule`
 * @param x Any value
 * @returns Is x a rule?
 */
function isRule(x: any): x is ShieldRule {
    return x instanceof Rule || x instanceof LogicRule;
}

/**
 * Merges an array of rule maps where leafs at the same path are mapped by a
 * callback.
 * @param perms Array of rule maps.
 * @param mergeLeaf Function to merge an array of leafs at the same path
 * @returns Merged rules
 */
function mergePerms(
    perms: IRules[],
    mergeLeaf: (leafPerms: ShieldRule[]) => ShieldRule,
): IRules {
    const arrayPerms = perms.map((perm) => mapLeafs(perm, (leaf) => [leaf], isRule));
    const merged = arrayPerms.reduce(mergeArrayMap);
    return mapLeafs(merged, mergeLeaf, isArray) as IRules;
}

/**
 * Merges an array of rule maps such that leafs at the same path are put into a
 * disjunction.
 * @param perms Array of rule maps.
 * @returns Rule map where each leafs is a disjunction
 */
export function OR(...perms: IRules[]): IRules {
    return {};
    //return mergePerms(perms, (leafPerms: ShieldRule[]) => {const rule: RuleOr = new RuleOr(leafPerms); return rule});
}

/**
 * Map of user role to the role's permissions.
 */
type RBAC = { [k in Role]?: IRules };

/**
 * Merges a map of role-based access control rules into a single map of rules.
 * The resulting IRules map checks for every `[role, rules]` key-value pair
 * provided in `perms` if the user logged in as the role `role` and if so,
 * continues to check if `rules` holds. If the user has no role, the `defaults`
 * rules are applied (if present).
 * @param perms Role-based access control constraints
 * @param defaults Constraints that always hold even for users that are not
 * logged in
 * @returns Map of rules that check user roles and map it to the correct
 * permissions
 */
export function rbac(perms: RBAC, defaults?: IRules): IRules {
    return {};
    /* var arrAdmin: IRules[] = [];
    var arr: IRules[] = [];
    if(perms.ADMINISTRATOR){
        arrAdmin.push(perms.ADMINISTRATOR);
        arrAdmin.push(callerHasRole(Role.ADMINISTRATOR));
        const ruleAdmin: IRules = mergePerms(arrAdmin,(leafPerms: ShieldRule[]) => {const rule: RuleAnd = new RuleAnd(leafPerms); return rule});
        arr.push(ruleAdmin);
    }
    var arrFree: IRules[] = [];
    if(perms.FREE){
        arrFree.push(perms.FREE);
        arrFree.push(callerHasRole(Role.FREE));
        const ruleFree: IRules = mergePerms(arrFree,(leafPerms: ShieldRule[]) => {const rule: RuleAnd = new RuleAnd(leafPerms); return rule});
        arr.push(ruleFree);
    }
    var arrPremium: IRules[] = [];
    if(perms.PREMIUM){
        arrPremium.push(perms.PREMIUM);
        arrPremium.push(callerHasRole(Role.PREMIUM));
        const rulePremium: IRules = mergePerms(arrPremium,(leafPerms: ShieldRule[]) => {const rule: RuleAnd = new RuleAnd(leafPerms); return rule});
        arr.push(rulePremium);
    }
    var arrModerator: IRules[] = [];
    if(perms.MODERATOR){
        arrModerator.push(perms.MODERATOR);
        arrModerator.push(callerHasRole(Role.MODERATOR));
        const ruleModerator: IRules = mergePerms(arrModerator,(leafPerms: ShieldRule[]) => {const rule: RuleAnd = new RuleAnd(leafPerms); return rule});
        arr.push(ruleModerator);
    }
    if(defaults){
        arr.push(defaults);
    }
    if(arr){
        return mergePerms(arr,(leafPerms: ShieldRule[]) => {const rule: RuleOr = new RuleOr(leafPerms); return rule})
    }else{
        return {};
    } */
}
