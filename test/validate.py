#!/bin/env python3

import argparse
import json
import jsonschema
import logging
import os
import sys


def parse_args(args):
    parser = argparse.ArgumentParser(
        prog='Test File Schema Validator',
        description='Validate all of the test case JSON files against the JSON Schema file'
    )

    parser.add_argument('--schema-dir',
                        help='The directory containing the JSON schema file for the test cases (dir named according to a semantic version)')
    parser.add_argument('--test-dir', 
                        default='tests',
                        help='The base directory in which all test files are contained')

    # ignore the executable's name from the arg list, which is in the first position
    return parser.parse_args(args[1:])

def main(args):
    # initialize logging
    logging.basicConfig(format='[%(asctime)s] [%(levelname)s]  %(message)s', level=logging.INFO)

    # parse args
    parsed_args = parse_args(args)

    # get schema file from the schema dir
    schema_dir = parsed_args.schema_dir
    schema_file_paths = os.listdir(path = schema_dir)
    assert len(schema_file_paths) == 1, "there should only be 1 schema(s) definition file for a given schema version"
    schema_file_path = os.path.join(schema_dir, schema_file_paths[0])
    logging.debug("schema file path: %s", schema_file_path)
    schema_file = open(schema_file_path, encoding='utf-8', mode='r')
    schema = json.load(schema_file)
    
    # iterate over all files in the test case file dir and validate against the schema
    test_dir = parsed_args.test_dir
    for (dirpath, dirnames, filenames) in os.walk(test_dir):
        for test_filename in filenames:
            test_file_path = os.path.join(dirpath, test_filename)
            logging.debug("test file path: %s", test_file_path)
            test_file = open(test_file_path, encoding='utf-8', mode='r')
            logging.debug("verifying test case file: %s", test_file_path)
            tests = json.load(test_file)
            jsonschema.validate(tests, schema)

            test_file.close()
    schema_file.close()
            
    logging.info("Completed verification of all test case files successfully")
    
if __name__ == "__main__":
    main(sys.argv)
