# tourism-map feature

## Responsibilities
- Render map shell and summary/detail POI views.
- Trigger route calculation from A to B.
- Keep UI independent from concrete data adapters.

## Boundaries
- Containers orchestrate store and navigation.
- UI components only use Inputs/Outputs.
- Store depends on `TOURISM_POI_REPO` token.
- Adapters perform HTTP/mock integration.
