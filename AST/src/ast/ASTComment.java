package ast;

import java.util.ArrayList;
/**
 * @author SOON WEI JUN A0156192A
 * this class is mainly in charge of AST node construction of comments in C/Java/Python Programs
 */
public class ASTComment extends ASTBlockStatement {
	private static final String NODE_TYPE = "Comment";
	protected ArrayList<ASTStatement> statements;
	protected ArrayList<Integer> commentedOutLines;
	protected int numLines;
	
	public ASTComment() {
		super();
		this.statements = new ArrayList<ASTStatement>();
		this.commentedOutLines = new ArrayList<Integer>();
		this.numLines = 0;
	}
	
	public void addStatement(ASTStatement s){
		this.statements.add(s);
		s.addParent(this);
		this.numLines += s.toSyntax().split("\n").length;
	}
	
	public void addCommentedOutLine(int line){
		this.commentedOutLines.add(line);
	}
	
	public int getNumLines(){
		return this.numLines;
	}
	
	public String toSyntax(){
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
