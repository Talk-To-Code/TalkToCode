package ast;
import java.util.*;
/**
 * @author GAO RISHENG A0101891L
 * This class is mainly in charge of AST node construction and syntax generation of
 * Pass statement in Python programs
 * (C and Java do not support pass statement)
 *
 */
public final class ASTPassStatement extends ASTSimpleStatement {
	private static final String NODE_TYPE = "Pass Statement";
	public ASTPassStatement() {
		super();
	}
	public String toSyntax(){
		this.result = "pass\n";
		return this.result;
	}
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
	public String toTree(int indent){
		StringBuilder sb = new StringBuilder("");
		for(int i = 0;i<indent;i++){
			sb.append("\t");
		}
		sb.append(this.typeof());
		sb.append("\n");
		return sb.toString();
	}
}
