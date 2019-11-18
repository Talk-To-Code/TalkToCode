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

import ast.ASTCompilationUnit;
import ast.ASTCompilationUnitP;
import ast.ASTParser;
import ast.ParseException;

import org.junit.Test;

/**
 * @author GAO RISHENG
 * This test is in charge of testing the correctness of generated Python program by verifying the name as 
 * well as the content of generated Python program and the expected outputs
 */
public class P_Program_Test {
	private static ASTParser parser;

	@Test
	public void test() {
		generateActualOutput();
		HashMap<String,String> expectedOutputs = constructComparisonMap();
		compare(expectedOutputs);
	}


	private void generateActualOutput() {
		//enter the input path
		File inputDirectory = new File("./input/program input/P Progs/");
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
					//if(parser == null) parser = new ASTParser(fis);
					ASTParser.ReInit(fis);
					ASTCompilationUnit actualProgram = ASTParser.program();
					//enter the output path
					((ASTCompilationUnitP) actualProgram).toFile("./output/program actual outputs/P Progs/");
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
		File inputDirectory = new File("./output/program expected outputs/P Progs/");
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
		File inputDirectory = new File("./output/program actual outputs/P Progs/");
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


