{
  "targets": [
    {
      "target_name": "tree_sitter_mcpscript_binding",
      "dependencies": [
        "<!(node -p \"require('node-addon-api').targets\"):node_addon_api_except",
      ],
      "include_dirs": [
        "src",
      ],
      "sources": [
        "bindings/node/binding.cc",
        "src/parser.c",
      ],
      "conditions": [
        ["OS!='win'", {
          "cflags_c": [
            "-std=c11",
          ],
          "cflags_cc": [
            "-std=c++20",
          ],
        }, { # OS == "win"
          "cflags_c": [
            "/std:c11",
            "/utf-8",
          ],
          "cflags_cc": [
            "/std:c++20",
            "/utf-8",
          ],
        }],
      ],
    }
  ]
}
