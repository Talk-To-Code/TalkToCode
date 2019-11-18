package ASTTest;

import static org.hamcrest.CoreMatchers.containsString;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.channels.FileChannel;
import java.util.ArrayList;

import org.junit.Test;

import ast.ASTNode;
import ast.ASTParser;
import junit.framework.TestCase;

public class CompoundPyTest extends TestCase {
	private static ASTParser parser;
	@Test
	public void testCompound() {
		try {
			InputStream in = new FileInputStream(new File("./input/Compoundinput.txt"));
			BufferedReader inBR = new BufferedReader(new InputStreamReader(in));
			FileChannel inChannel = ((FileInputStream) in).getChannel();
			InputStream out = new FileInputStream(new File("./output/CompoundoutputPy.txt"));
			BufferedReader br = new BufferedReader(new InputStreamReader(out));
			ArrayList<String> expectedOutput = new ArrayList<String>();
			String temp;
			int count = 0;
			int[] pos = new int[10000];
			int currentPos = 0;
			while((temp=inBR.readLine())!=null){
				currentPos += temp.length() + 2;
				pos[count] = currentPos;
				count++;
			}
			inChannel.position(0);
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
					assertThat(ex.getMessage(), containsString("Not supported in Python"));
					inChannel.position(pos[testNo]);
					ASTParser.ReInit(in);
					testNo++;
				}
			}
		} catch(IOException e){
			e.printStackTrace();
		}
	}
}
