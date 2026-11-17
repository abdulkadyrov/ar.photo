import { test } from "node:test";
import assert from "node:assert/strict";
import { association } from "./association.mjs";

test("requires identifiers rather than deploying a wildcard or placeholder", () => {
  for (const team of ["", "*", "TEAM_ID", "abc", "a".repeat(10)]) {
    assert.throws(() => association(team, "ru.khanzama.arphoto"));
  }
  assert.throws(() => association("TEST123456", "*"));
});
test("links the clip and parent only to public routes", () => {
  const result = association("TEST123456", "ru.khanzama.arphoto");
  assert.deepEqual(result.appclips.apps, ["TEST123456.ru.khanzama.arphoto.Clip"]);
  assert.deepEqual(result.applinks.details[0].appIDs, ["TEST123456.ru.khanzama.arphoto"]);
  assert.deepEqual(
    result.applinks.details[0].components.map((entry) => entry["/"]),
    ["/ar.photo/ar/*", "/ar.photo/camera", "/ar.photo/camera/"],
  );
});
