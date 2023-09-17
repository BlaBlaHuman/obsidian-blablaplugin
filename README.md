  # BlaBlaPlugin

  Test task for *A distributed local-first note taking system* thesis project @ **JetBrains** by Oleg Makeev.

  ## Setting up

  1. Create a new dedicated vault (please, do not test it on your private vault).
  2. Clone this repo to `vault_path/.obsidian/plugins`

  ## Features

  ### Template enhancements
  * Expand a template directly by its name! Just type a word, select it and then call `Expand template` action. If there nothing was selected, a list of all actions will appear. If there are two templates with the same name, a list of these templates will appear. You can also sync templates folder with *Templates* built-in plugin.
  * A new macro for relative dates! Just type `{{date + number}}` in your template and then expand it using *BlaBlaPlugin*. Unfortunately, this feature does not work when inserting template with the built-in plugin.

  ### Copy / paste improvements
  * Copy only structural formatting by calling `Copy structural formatting only` command. It won't copy any html formatting tags.
  * Copy plain Markdown with `Copy plain markdown` action. It will always strip *aliases*, *tag formatting* and *footnotes*. All other parameters can be changed in settings. Note: many features were copied from [Copy as HTML](https://github.com/jenningsb2/copy-as-html) plugin.

  ### Daily notes enhancements
  * You can now open your daily notes for yesterday/today/tomorrow with dedicated actions! Also, there is a new ribbon icon with all these actions.
  * "Wow, I don't see any settings regarding daily notes, where are they?". Date format, daily notes location and template location are all synced with *Daily notes* plugin itself, so you don't have to set it up yourself!

  ### TODO lists
  * You can toggle on automatic completed TODO items removal. If turned on, all the checked TODOs will disappear within 2 seconds after the last edit.

  ### Other features
  * `Remove empty lines` action will remove all insignificant empty lines.
