from NewWordParser import Stack
from WordCorrector import WordCorrector
from NewWordParser import WordParser as newWordParser
import StructuralCommandParser as scParser
import copy
from StandardFunctions import StandardFunctions
import os
import sys, getopt


def build_var_list_from_stack(stackClass):
    temp_set = {variable for curr_var_list in stackClass.stack for variable in curr_var_list}
    temp_set2 = {std_func for std_func in std_funcs}

    return list(temp_set.union(temp_set2))


def get_struct_command_from_text_list(wordParser, text_list):
    struct_command_list = []

    for text in text_list:
        res = wordParser.parse(text)
        structured_command = res["parsed"][0]
        struct_command_list.append(structured_command)
    return " ".join(struct_command_list)


def build_string_from_stack(stackClass, accepted_indices):
    if len(accepted_indices) == 0:
        last_accepted_index = -1
    else:
        last_accepted_index = accepted_indices[len(accepted_indices) - 1]

    joined_string = [stackClass.stack[i] for i in range(last_accepted_index + 1, len(stackClass.stack))]

    return " ".join(joined_string)


def print_code(to_add_corrected, parsed_sc, wordParser):
    accepted_text_list = []
    curr_text = []
    curr_index = 0
    for i in range(0, len(text_history_stack.stack)):
        if curr_index < len(accepted_indices) and i == accepted_indices[curr_index]:
            curr_text.append("{} ".format(text_history_stack.stack[i]))
            curr_index += 1
            accepted_text_list.append(" ".join(curr_text))
            curr_text = []
        else:
            curr_text.append(text_history_stack.stack[i])

    structured_command = ""
    try:
        structured_command = get_struct_command_from_text_list(wordParser, accepted_text_list)
        if to_add_corrected:
            structured_command = "{} {}".format(structured_command, parsed_sc)
    except:
        structured_command = ""

    code = scParser.parse_structural_command_to_code(structured_command)

    if scParser.SPECIAL_REJECT_SEQ in code:
        # Error found when parsing with sc parser.
        prev_code = code_stack.peek()
        code_stack.push(prev_code)
        error_from_scparser = True  # lawman still not sure what this is for
    else:
        # Conversion is good with sc parser.
        code_stack.push(code)
        # print("####################printing code####################")
        print(code)
        error_from_scparser = False  # lawman still not sure what this is for


def get_string_from_stack(stack_item, checker):
    string_to_store = ""
    for i in range(len(stack_item.stack)):
        if checker == "var":
            string_to_store += str(stack_item.stack[i]).strip("[").strip("]").strip("'") + " "
        elif checker == "code":
            list_of_code = str(stack_item.stack[i]).split("\n\r\n")
            for j in range(len(list_of_code)):
                string_to_store += list_of_code[j] + " "
        else:
            string_to_store += str(stack_item.stack[i]) + " "

    return string_to_store + '\n'


def get_string_from_list(list_item):
    string_to_store = ""
    for item_ in list_item:
        string_to_store += str(item_) + " "
    return string_to_store + '\n'


def dumb_way_to_store(variable_stack, variable_list, code_stack, create_func_stack, open_string_stack,
                      accepted_indices_list, current_index):
    f = open("..\\..\\..\\..\\Desktop\\talktocode\\talk-to-code\\src\\dumb_way_to_keep_info.txt", "w")

    f.write(get_string_from_stack(variable_stack, "var"))
    f.write(get_string_from_stack(code_stack, "code"))
    f.write(get_string_from_stack(create_func_stack, "none"))
    f.write(get_string_from_stack(open_string_stack, "none"))
    f.write(get_string_from_list(variable_list))
    f.write(get_string_from_list(accepted_indices_list))
    f.write(str(current_index))
    f.close()


def dumb_way_to_read():
    f = open("..\\..\\..\\..\\Desktop\\talktocode\\talk-to-code\\src\\dumb_way_to_keep_info.txt", "r")

    content = f.readline().split(" ")
    variable_stack = Stack()
    for i in range(0, len(content) - 1):
        variable_stack.push([content[i]])

    code_stack = Stack()
    content = f.readline().split("#include <stdio.h>")
    for i in range(0, len(content)):
        if content[i] == "":
            i -= 1
            continue
        code_snippet = "#include <stdio.h>\n\r\n"

        codelines = content[i].split(";")
        for codes in codelines[:-1]:
            code_snippet += codes.strip() + ";\n\r\n"

        code_stack.push(code_snippet)

    create_func_stack = Stack()
    content = f.readline().split(" ")
    for i in range(0, len(content) - 1):
        if content[i] == "True":
            create_func_stack.push(True)
        else:
            create_func_stack.push(False)

    open_string_stack = Stack()
    content = f.readline().split(" ")
    for i in range(0, len(content) - 1):
        if content[i] == "True":
            open_string_stack.push(True)
        else:
            open_string_stack.push(False)

    variable_list = []
    content = f.readline().split(" ")
    for i in range(0, len(content) - 1):
        variable_list.append(content[i])

    accepted_indices_list = []
    content = f.readline().split(" ")
    for i in range(0, len(content) - 1):
        accepted_indices_list.append(int(content[i]))

    current_index = int(f.readline().strip())

    f.close()

    return variable_stack, variable_list, code_stack, create_func_stack, open_string_stack, accepted_indices_list, current_index


wordCorrector = WordCorrector("", [])

variables_stack = Stack()
text_history_stack = Stack()
code_stack = Stack()
create_func_complete = Stack()
open_string = Stack()

wordParser = newWordParser()
accepted_indices = []
current_index = 0

variables_list = []
std_funcs = StandardFunctions().get_std_functions()


if os.path.isfile("..\\..\\..\\..\\Desktop\\talktocode\\talk-to-code\\src\\dumb_way_to_keep_info.txt"):
    variables_stack, variables_list, code_stack, create_func_complete, open_string, accepted_indices, current_index = dumb_way_to_read()

variables_list = build_var_list_from_stack(variables_stack)

argument = ''
usage = 'usage: myscript.py -f <sometext>'
# parse incoming arguments
try:
    opts, args = getopt.getopt(sys.argv[1:],"hf:",["foo="])
except getopt.GetoptError:
    print(usage)
    sys.exit(2)

for opt, arg in opts:
    if opt == '-h':
        print(usage)
        sys.exit()
    elif opt in ("-f", "--foo"):
        argument = arg

for word in args:
    argument += " " + word
# print output

wordCorrector = WordCorrector(argument, variables_list, create_func_complete.peek(), open_string.peek())
corrected = wordCorrector.run_correction()
text_to_parse = "{} {}".format(build_string_from_stack(text_history_stack, accepted_indices), str(corrected))

temp_parse_struct = wordParser.parse(text_to_parse, True)


result_structure = copy.deepcopy(temp_parse_struct)

for i in range(0, len(result_structure["sentence_status"])):
    if result_structure["sentence_status"][i]:  # sentence can be parsed.
        variable_current = result_structure["variables"][i]
        parsed = result_structure["parsed"][i]

        variables_stack.push(variable_current)
        create_func_complete.push(result_structure["func_dec_complete"][i])
        open_string.push(result_structure["open_string"][i])

        if len(result_structure["text"][i]) < len(str(corrected)):
            text_history_stack.push(result_structure["text"][i])
        else:
            text_history_stack.push(str(corrected))

        accepted_indices.append(current_index)
        print_code(False, parsed, wordParser)

        current_index += 1
    else:  # sentence cannot be parsed.
        error_message = result_structure["expected"]
        potential_missing = result_structure["potential_missing"]
        variable_current = result_structure["variables"][i]
        parsed = result_structure["parsed"][i]

        variables_stack.push(variable_current)
        create_func_complete.push(result_structure["func_dec_complete"][i])
        open_string.push(result_structure["open_string"][i])

        if len(result_structure["text"][i]) < len(str(corrected)):
            text_history_stack.push(result_structure["text"][i])
        else:
            # need to append end equal to avoid bug where prev sentence ends with var name,
            # and subsequent sentence is another var assignment (begins with var name)
            # It is then hard to decipher which var name belongs to which sentence.
            if wordParser.need_to_append_end_equal(str(corrected)):
                corrected = "{} end equal".format(str(corrected))
            # the same problem for end declare here.
            elif wordParser.need_to_append_end_declare(str(corrected)):
                corrected = "{} end declare".format(str(corrected))
            text_history_stack.push(str(corrected))
        print_code(True, parsed, wordParser)

        current_index += 1

dumb_way_to_store(variables_stack, variables_list, code_stack,
                    create_func_complete, open_string, accepted_indices, current_index)
