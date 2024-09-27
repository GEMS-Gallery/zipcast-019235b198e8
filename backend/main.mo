import Bool "mo:base/Bool";
import Text "mo:base/Text";

import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Nat "mo:base/Nat";

actor WeatherApp {
  type WeatherQuery = {
    zipCode: Text;
    timestamp: Int;
  };

  let MAX_QUERIES = 10;
  let RATE_LIMIT_WINDOW = 60_000_000_000; // 1 minute in nanoseconds

  stable var recentQueries : [WeatherQuery] = [];
  
  public func addQuery(zipCode: Text) : async Bool {
    let currentTime = Time.now();
    let newQuery : WeatherQuery = {
      zipCode = zipCode;
      timestamp = currentTime;
    };

    // Remove queries older than the rate limit window
    let filteredQueries = Array.filter<WeatherQuery>(recentQueries, func(item) {
      currentTime - item.timestamp < RATE_LIMIT_WINDOW
    });

    // Check if we've exceeded the rate limit
    if (filteredQueries.size() >= MAX_QUERIES) {
      return false;
    };

    // Add the new query
    let buffer = Buffer.fromArray<WeatherQuery>(filteredQueries);
    buffer.add(newQuery);
    recentQueries := Buffer.toArray(buffer);

    return true;
  };

  public query func getRecentQueries() : async [Text] {
    Array.map<WeatherQuery, Text>(recentQueries, func(item) { item.zipCode })
  };
}
