package ASTTest;

import static org.junit.Assert.*;
import java.util.*;


import org.junit.Test;

import ast.ASTNode;
import ast.ASTParser;

import java.io.*;
import java.nio.channels.FileChannel;
public class SetTest {
	private static ASTParser parser;
	@Test
	public void testSet() {
		try {
			InputStream in = new FileInputStream(new File("./input/SetInput.txt"));
			InputStream out = new FileInputStream(new File("./output/SetOutput.txt"));
			BufferedReader br = new BufferedReader(new InputStreamReader(out));
			ArrayList<String> expectedOutput = new ArrayList<String>();
			String temp;
			int count = 0;
			//parser = new ASTParser(in);
			ASTParser.ReInit(in);
			count = 0;
			while((temp=br.readLine())!=null){
				expectedOutput.add(temp);
				count++;
			}
			int testNo = 0;
			while(testNo!=count){
				try {
					assertEquals(testNo+" "+expectedOutput.get(testNo)+"\n",testNo+" "+parser.statement(new ASTNode(), ASTParser.programType.P, 0).toSyntax());
					testNo++;
				} catch (Exception ex){
					//ex.printStackTrace();
				}
			}
		} catch(IOException e){
			e.printStackTrace();
		}
	}

}
