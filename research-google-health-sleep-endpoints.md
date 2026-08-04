### Research Findings for Google Health API - Sleep Data

**1. OAuth Scopes**
To access sleep data via the new Google Health API (successor to the legacy Fitbit Web API), the required scopes are:
*   **Read Access:** `https://www.googleapis.com/auth/googlehealth.sleep.readonly`
*   **Write Access:** `https://www.googleapis.com/auth/googlehealth.sleep.writeonly`

**2. REST Endpoint for Daily Sleep Statistics**
The legacy Fitbit endpoint (`https://api.fitbit.com/1.2/user/-/sleep/date/...`) has been replaced by the `dailyRollUp` method in the Google Health API. This endpoint aggregates health data points over civil time intervals (like daily summaries).

*   **Endpoint:** `POST https://health.googleapis.com/v4/users/me/dataTypes/sleep/dataPoints:dailyRollUp`
*   **Method:** `POST`
*   **Payload Requirements:** The request requires a JSON body containing a `range` (`CivilTimeInterval`) defining the start and end of the period. Optionally, `windowSizeDays` can be passed (defaults to 1 for a daily summary).
*   **Note:** The maximum range for rolling up sleep data in a single request is 90 days. Users should use `users/me` as the user identifier.
