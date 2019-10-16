package ast;
import java.util.*;
/**
 * @author GAO RISHENG A0101891L
 * This class is mainly in charge of AST node construction and syntax generation of
 * Pass statement in Python programs
 * (C and Java do not support pass statement)
 *
 */
public final class ASTPassStatement extends ASTBlockStatement {
	private static final String NODE_TYPE = "Pass Statement";
	private ArrayList<ASTStatement> statements;
	public ASTPassStatement() {
		super();
		this.statements = new ArrayList<ASTStatement>();
	}
	public void addStatement(ASTStatement s){
		this.statements.add(s);
		s.addParent(this);
	}
	public String toSyntax(){
		this.result ="pass:\n";
		for(int i =0;i<this.statements.size();i++){
			this.result+="\t"+this.statements.get(i).toSyntax();
		}
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
		for(ASTStatement s:this.statements){
			sb.append(s.toTree(indent+1));
			sb.append("\n");
		}
		return sb.toString();
	}
}
