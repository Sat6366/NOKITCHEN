// // components/common/RootNavigation.ts
// import { createNavigationContainerRef } from "@react-navigation/native";
// import type { RootStackParamList } from "../../App";

// export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// export function navigate<RouteName extends keyof RootStackParamList>(
//   name: RouteName,
//   params?: RootStackParamList[RouteName]
// ) {
//   if (navigationRef.isReady()) {
//     navigationRef.navigate(name, params);
//   }
// }
// components/common/RootNavigation.ts
// components/common/RootNavigation.ts
import { createNavigationContainerRef } from "@react-navigation/native";
import type { RootStackParamList } from "../../App";

// Create typed navigation ref
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Global navigate helper.
 * Example:
 *   navigate("Main");
 *   navigate("Orders");
 */

export function navigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName]
) {
  if (navigationRef.isReady()) {
    // Cast to avoid TS tuple overload errors
    (navigationRef.navigate as any)(name, params);
  }
}
