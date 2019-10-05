package ASTTest;

import static org.junit.Assert.*;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Stack;

import ast.ASTCompilationUnitC;
import ast.ASTParser;
import ast.ParseException;

import org.junit.Test;

/**
 * @author GAO RISHENG
 * This test is in charge of testing the correctness of generated C program by verifying the name as 
 * well as the content of generated C program and the expected outputs
 */
public class C_Program_Test {

	@Test
	public void test() {
		generateActualOutput();
		HashMap<String,String> expectedOutputs = constructComparisonMap();
		compare(expectedOutputs);
	}


	private void generateActualOutput() {
		ASTParser parser = null;
		//enter the input path
		File inputDirectory = new File("E:\\study\\FYP\\talk-to-code\\input\\program input\\");
		Stack<File> allFiles = new Stack<File>();
        allFiles.push(inputDirectory);
        while (!allFiles.isEmpty()) {
            File f = allFiles.pop();
            if (f.isDirectory()) {
                File[] files = f.listFiles();
                for (File t : files) {
                    allFiles.push(t);
                }
            } else {
            	try {            		
					FileInputStream fis = new FileInputStream(f);
					if(parser == null){
						parser = new ASTParser(fis);
					} else {
						ASTParser.ReInit(fis);
					}
					ASTCompilationUnitC actualProgram = ASTParser.programC();
					//enter the output path
					actualProgram.toFile("E:\\study\\FYP\\talk-to-code\\output\\program actual outputs\\");
				} catch (FileNotFoundException e) {

					e.printStackTrace();
				} catch (ParseException e) {
					e.printStackTrace();
				}
            }
        }
	}
	
	private HashMap<String,String> constructComparisonMap(){
		HashMap<String,String> allPrograms = new HashMap<String,String>();
		File inputDirectory = new File("E:\\study\\FYP\\talk-to-code\\output\\program expected outputs\\");
		Stack<File> allFiles = new Stack<File>();
        allFiles.push(inputDirectory);
        while (!allFiles.isEmpty()) {
            File f = allFiles.pop();
            if (f.isDirectory()) {
                File[] files = f.listFiles();
                for (File t : files) {
                    allFiles.push(t);
                }
            } else {
            	String name = f.getName();
            	try {
					String content = new String(Files.readAllBytes(Paths.get(f.getAbsolutePath())));
					allPrograms.put(name, content);
				} catch (IOException e) {
					e.printStackTrace();
				}
            }
        }
        return allPrograms;
	}
	private void compare(HashMap<String,String> map){
		File inputDirectory = new File("E:\\study\\FYP\\talk-to-code\\output\\program expected outputs\\");
		Stack<File> allFiles = new Stack<File>();
        allFiles.push(inputDirectory);
        while (!allFiles.isEmpty()) {
            File f = allFiles.pop();
            if (f.isDirectory()) {
                File[] files = f.listFiles();
                for (File t : files) {
                    allFiles.push(t);
                }
            } else {
            	assertTrue(map.containsKey(f.getName()));
            	String name = f.getName();
            	try {
					String content = new String(Files.readAllBytes(Paths.get(f.getAbsolutePath())));
					assertEquals(map.get(f.getName()),content);
				} catch (IOException e) {
					e.printStackTrace();
				}
            }
        }
	}
}


